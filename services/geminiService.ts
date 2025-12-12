import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the response schema explicitly for Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["Verified", "Suspicious", "High Risk"],
      description: " The forensic verdict of the media.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100.",
    },
    reasoning_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of logical steps leading to the verdict, ordered by importance.",
    },
    visual_hotspots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: "Normalized X coordinate (0-1)" },
          y: { type: Type.NUMBER, description: "Normalized Y coordinate (0-1)" },
          width: { type: Type.NUMBER, description: "Normalized width (0-1)" },
          height: { type: Type.NUMBER, description: "Normalized height (0-1)" },
          label: { type: Type.STRING, description: "Description of the artifact" },
          shape: { type: Type.STRING, enum: ["rect", "circle"] },
        },
        required: ["x", "y", "width", "height", "label", "shape"],
      },
    },
    reality_subtext: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "The original text segment visible in the image." },
          translation: { type: Type.STRING, description: "The psychological 'truth translation' (e.g. 'PANIC INDUCER')." },
          x: { type: Type.NUMBER, description: "Normalized X coordinate (0-1)" },
          y: { type: Type.NUMBER, description: "Normalized Y coordinate (0-1)" },
          width: { type: Type.NUMBER, description: "Normalized width (0-1)" },
          height: { type: Type.NUMBER, description: "Normalized height (0-1)" },
        },
        required: ["original", "translation", "x", "y", "width", "height"],
      },
      description: "Subtext analysis of text segments.",
    },
    extracted_text: {
      type: Type.STRING,
      description: "Full raw text extracted from the image/video using OCR. Return null if no text is detected.",
    },
    jury_result: {
      type: Type.OBJECT,
      properties: {
        chat: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING, enum: ['Visual Forensics Bot', 'Legal Bot', 'Psychology Bot'] },
              message_text: { type: Type.STRING },
              avatar: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              order: { type: Type.INTEGER },
            },
            required: ["speaker", "message_text", "avatar", "order"],
          }
        },
        final_verdict: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            consensus_level: { type: Type.STRING, enum: ['full agreement', 'partial disagreement', 'significant disagreement'] },
            supporting_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "consensus_level", "supporting_points"],
        }
      },
      required: ["chat", "final_verdict"],
    },
    action_plan: {
      type: Type.OBJECT,
      properties: {
        safe_reply: { type: Type.STRING, description: "Suggested safe text reply to a potential scammer." },
        report: { type: Type.STRING, description: "Template text to report the issue to authorities." },
        voice_briefing: { type: Type.STRING, description: "A short summary text suitable for text-to-speech." },
      },
    },
    error: { type: Type.STRING, nullable: true },
  },
  required: ["status", "confidence", "reasoning_steps", "visual_hotspots", "jury_result", "action_plan"],
};

export const analyzeMedia = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to Base64
  const base64Data = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using 3 Pro for advanced visual reasoning and deepfake detection
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          },
          {
            text: `You are "VERITAS", an expert digital forensics AI. Your job is to scrutinize the provided media for *any* sign of manipulation, AI generation, deepfakes, or fraud.

            **INSTRUCTIONS:**
            Adopt a HIGHLY SKEPTICAL stance. Do not assume the image is real. actively hunt for:
            
            1. **AI Generation Artifacts**: 
               - Look for "plastic" or overly smooth skin texture.
               - Check for asymmetry in accessories (earrings, glasses) or eyes.
               - Inspect hands and fingers closely for malformations.
               - Analyze background text for gibberish or weird blending.
               - Check for inconsistent lighting or shadows that don't match the light source.
            
            2. **Digital Editing/Photoshop**:
               - Look for clone stamping patterns.
               - Check for sharp, unnatural edges around objects (masking errors).
               - Look for warping or "liquify" effects.
               - Verify noise level consistency across the image.

            3. **Content Inconsistencies**:
               - Mismatched fonts or text alignment in documents.
               - Logical fallacies (e.g., reflection showing something different).

            4. **The Agentic Jury (Live Debate)**:
               Simulate a conversation between 3 expert AI bots analyzing this image. 
               - **Visual Forensics Bot**: Focuses ONLY on pixels, artifacts, fonts, and lighting.
               - **Legal Bot**: Focuses ONLY on text content, copyright, fraud indicators, and legality.
               - **Psychology Bot**: Focuses ONLY on emotional manipulation, urgency, and social engineering.
               
               Generate 3 short chat messages (one per bot) debating the image.
               Then, provide a "Final Jury Verdict" summarizing their consensus.

            5. **Reality Lens (Subtext Decoder)**:
               - Identify specific text segments or visual elements that carry psychological manipulation.
               - Extract the 'original' text.
               - Generate a 'truth translation' (e.g., "Dear Valued Customer" -> "TARGETED VICTIM").
               - Provide precise bounding boxes.
               
            6. **OCR Extraction**:
               - Extract all legible visible text from the image verbatim.

            **VERDICT LOGIC:**
            - If you find ANY artifacts (weird fingers, smooth skin, background blurriness), mark as "Suspicious" or "High Risk".
            - Only mark "Verified" if the image contains natural sensor noise, consistent lighting, and zero logical flaws.

            Return the result in strict JSON format matching the schema provided.
            Ensure 'visual_hotspots' coordinates are normalized (0.0 to 1.0).`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for precise, analytical output
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI.");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (err: any) {
    console.error("Gemini Analysis Error:", err);
    return {
      status: null,
      confidence: null,
      reasoning_steps: null,
      visual_hotspots: null,
      reality_subtext: null,
      extracted_text: null,
      jury_result: null,
      action_plan: null,
      error: err.message || "Failed to analyze media.",
    };
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};