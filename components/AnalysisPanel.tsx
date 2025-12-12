import React from "react";
import { AnalysisResult } from "../types";
import { AgenticJury } from "./AgenticJury";

interface AnalysisPanelProps {
  loading: boolean;
  result: AnalysisResult | null;
  showRealityLens: boolean;
  onToggleRealityLens: (show: boolean) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  loading,
  result,
  showRealityLens,
  onToggleRealityLens,
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Verified":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/50",
          text: "text-emerald-400",
          glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
          barColor: "bg-emerald-500",
          barGlow: "shadow-[0_0_10px_#10b981]",
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case "Suspicious":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/50",
          text: "text-amber-400",
          glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]",
          barColor: "bg-amber-500",
          barGlow: "shadow-[0_0_10px_#f59e0b]",
          icon: (
            <svg className="w-10 h-10 animate-[pulse_3s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case "High Risk":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500",
          text: "text-red-500",
          glow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]",
          barColor: "bg-red-500",
          barGlow: "shadow-[0_0_15px_#ef4444]",
          icon: (
            <svg className="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return { 
          bg: "bg-slate-800", 
          border: "border-slate-700", 
          text: "text-slate-400", 
          glow: "", 
          barColor: "bg-slate-500", 
          barGlow: "",
          icon: null 
        };
    }
  };

  const styles = result?.status ? getStatusStyles(result.status) : null;

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-slate-900/30 flex justify-between items-center backdrop-blur-xl">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-sm mr-2 shadow-[0_0_10px_#3b82f6]"></span>
          Analysis Data
        </h2>
        {result && !result.error && (
            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${showRealityLens ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-slate-500'}`}>
                    <span className="text-sm leading-none">👁️</span> Reveal Subtext
                </span>
                <button
                    onClick={() => onToggleRealityLens(!showRealityLens)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                        showRealityLens ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-700 border border-slate-600'
                    }`}
                >
                    <span
                        className={`${
                            showRealityLens ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
                    />
                </button>
            </div>
        )}
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-2 border-slate-700 rounded-full opacity-50"></div>
                <div className="absolute inset-4 border-2 border-b-cyan-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
             </div>
             <div>
                <p className="text-blue-400 font-mono text-xs uppercase tracking-widest mb-2 animate-pulse">Running Diagnostics...</p>
                <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-blue-500 animate-[shimmer_2s_infinite] w-1/2"></div>
                </div>
             </div>
          </div>
        ) : result && !result.error ? (
          <div className="space-y-6 animate-in fade-in duration-700 flex flex-col h-full">
            
            {/* Verdict Card */}
            {styles && (
                <div className={`relative p-6 rounded-lg border flex flex-col items-center text-center transition-all duration-500 ${styles.bg} ${styles.border} ${styles.glow}`}>
                {/* Decorative corners */}
                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${styles.border}`}></div>
                <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${styles.border}`}></div>
                <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${styles.border}`}></div>
                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${styles.border}`}></div>

                <div className={`mb-3 ${styles.text}`}>
                    {styles.icon}
                </div>
                <h3 className={`text-3xl font-black uppercase tracking-widest mb-1 ${styles.text} font-mono`}>
                    {result.status}
                </h3>
                
                {result.confidence && (
                    <div className="w-full max-w-[240px] mt-4">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-mono">
                        <span>Confidence Probability</span>
                        <span className={styles.text}>{result.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                        <div 
                        className={`h-full rounded-full transition-all duration-1000 ${styles.barColor} ${styles.barGlow}`}
                        style={{ width: `${result.confidence}%` }}
                        />
                    </div>
                    </div>
                )}
                </div>
            )}

            {/* Agentic Jury Section - Takes remaining space */}
            {result.jury_result && (
                <div className="flex-1 min-h-[400px]">
                    <AgenticJury result={result.jury_result} loading={loading} />
                </div>
            )}
            
            {/* Hotspot Count */}
            {result.visual_hotspots && result.visual_hotspots.length > 0 && (
                <div className="py-2 border-t border-white/5 flex justify-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                        {result.visual_hotspots.length} Anomalies Detected
                    </span>
                </div>
            )}
          </div>
        ) : result?.error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <h3 className="text-white font-mono uppercase tracking-widest mb-2">Analysis Failed</h3>
            <p className="text-slate-400 text-sm max-w-[250px]">{result.error}</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono opacity-50">Awaiting Evidence Input</p>
          </div>
        )}
      </div>
    </div>
  );
};