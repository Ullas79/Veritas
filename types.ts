export type AnalysisStatus = 'Verified' | 'Suspicious' | 'High Risk';

export interface VisualHotspot {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  shape: 'rect' | 'circle';
}

export interface RealitySubtext {
  original: string;
  translation: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ActionPlan {
  safe_reply?: string;
  report?: string;
  voice_briefing?: string;
}

export interface JuryMessage {
  speaker: string; // 'Visual Forensics Bot' | 'Legal Bot' | 'Psychology Bot'
  message_text: string;
  avatar: string;
  timestamp?: string;
  order: number;
}

export interface JuryVerdict {
  summary: string;
  consensus_level: string;
  supporting_points: string[];
}

export interface JuryResult {
  chat: JuryMessage[];
  final_verdict: JuryVerdict;
}

export interface AnalysisResult {
  status: AnalysisStatus | null;
  confidence: number | null;
  reasoning_steps: string[] | null;
  visual_hotspots: VisualHotspot[] | null;
  reality_subtext: RealitySubtext[] | null;
  extracted_text?: string | null;
  jury_result: JuryResult | null;
  action_plan: ActionPlan | null;
  error: string | null;
  segment_index?: number;
}