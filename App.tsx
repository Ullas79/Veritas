import React, { useState } from "react";
import { EvidencePanel } from "./components/EvidencePanel";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { ActionPanel } from "./components/ActionPanel";
import { analyzeMedia } from "./services/geminiService";
import { AnalysisResult } from "./types";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showRealityLens, setShowRealityLens] = useState<boolean>(false);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setLoading(true);
    setAnalysis(null);
    setShowRealityLens(false); // Reset lens on new upload

    try {
      const result = await analyzeMedia(uploadedFile);
      setAnalysis(result);
    } catch (error) {
      setAnalysis({
        error: "We couldn't analyze this file. Please try a clearer image or video.",
        status: null,
        confidence: null,
        reasoning_steps: null,
        visual_hotspots: null,
        reality_subtext: null,
        extracted_text: null,
        jury_result: null,
        action_plan: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setShowRealityLens(false);
  };

  return (
    <div className="min-h-screen text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-panel border-b-0 border-b-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50 mb-2">
        <div className="flex items-center space-x-4">
          <div className="relative group cursor-default">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
               {/* Veritas Logo */}
               <svg className="w-8 h-8 text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
                  <path d="M7 9L12 17L17 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" className="animate-pulse">
                     <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                  </circle>
               </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none uppercase font-mono tracking-tighter">
              VERITAS
            </h1>
            <div className="flex items-center space-x-2 mt-1">
                <span className="h-px w-8 bg-blue-500/50"></span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">Truth Verification Unit</p>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="flex items-center space-x-3 text-sm text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <div className="relative">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full relative"></div>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider">Processing Stream...</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Column 1: Evidence (Left) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-[500px]">
             <EvidencePanel
              file={file}
              onFileUpload={handleFileUpload}
              onReset={handleReset}
              hotspots={analysis?.visual_hotspots || null}
              realitySubtext={analysis?.reality_subtext || null}
              extractedText={analysis?.extracted_text || null}
              showRealityLens={showRealityLens}
            />
          </div>

          {/* Column 2: Analysis (Middle) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-[400px]">
            <AnalysisPanel 
              loading={loading} 
              result={analysis} 
              showRealityLens={showRealityLens}
              onToggleRealityLens={setShowRealityLens}
            />
          </div>

          {/* Column 3: Action (Right) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-[300px]">
            <ActionPanel loading={loading} plan={analysis?.action_plan || null} />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-xs uppercase tracking-widest border-t border-white/5 mt-auto bg-slate-900/50 backdrop-blur-sm">
        <p>
          ⚠️ VERITAS Output for Informational Purposes Only. Human Verification Required.
        </p>
      </footer>
    </div>
  );
};

export default App;