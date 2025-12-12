import React from "react";
import { ActionPlan } from "../types";

interface ActionPanelProps {
  plan: ActionPlan | null;
  loading: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ plan, loading }) => {
  const [playing, setPlaying] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handlePlayBriefing = () => {
    if (!plan?.voice_briefing) return;
    setPlaying(true);
    setTimeout(() => setPlaying(false), 5000); // Simulate simple playback duration
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(plan.voice_briefing);
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setPlaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-slate-900/30 flex justify-between items-center backdrop-blur-xl">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-sm mr-2 shadow-[0_0_10px_#10b981]"></span>
          Recommended Protocol
        </h2>
      </div>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {loading ? (
             <div className="space-y-4 opacity-50 animate-pulse">
                 <div className="h-24 bg-white/5 rounded-lg border border-white/5"></div>
                 <div className="h-24 bg-white/5 rounded-lg border border-white/5"></div>
             </div>
        ) : !plan ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4 space-y-3">
                 <div className="w-12 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                 </div>
                 <p className="text-xs uppercase tracking-widest font-mono opacity-50">Pending Analysis</p>
             </div>
        ) : (
            <>
                {/* Safe Reply Card */}
                <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4 hover:border-blue-500/30 transition-colors backdrop-blur-sm group">
                    <div className="flex items-center mb-3">
                        <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center mr-3 border border-blue-500/20 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-shadow">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-300 text-[10px] uppercase tracking-widest">Counter_Response_Msg</h3>
                    </div>
                    <div className="bg-black/40 p-3 rounded border-l-2 border-blue-500 text-sm text-slate-300 italic mb-3 font-mono shadow-inner">
                        "{plan.safe_reply || "No reply needed. It is safest to block this sender."}"
                    </div>
                    {plan.safe_reply && (
                        <button 
                            onClick={() => copyToClipboard(plan.safe_reply || "")}
                            className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-white flex items-center transition-colors ml-auto"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy_to_Clipboard
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Report Card */}
                <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4 hover:border-red-500/30 transition-colors backdrop-blur-sm group">
                     <div className="flex items-center mb-3">
                        <div className="w-6 h-6 rounded bg-red-500/10 text-red-400 flex items-center justify-center mr-3 border border-red-500/20 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-shadow">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-300 text-[10px] uppercase tracking-widest">Reporting_Protocol</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                        {plan.report || "We didn't detect a specific authority for this type of content. Consider reporting to your local consumer protection agency."}
                    </p>
                </div>

                {/* Audio Brief */}
                <button 
                    onClick={handlePlayBriefing}
                    disabled={!plan.voice_briefing || playing}
                    className={`w-full mt-4 p-3 rounded-lg border flex items-center justify-center space-x-2 transition-all duration-300 relative overflow-hidden group ${
                        playing 
                        ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                        : "bg-slate-800/50 hover:bg-slate-700 border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                    }`}
                >
                    {playing && (
                         <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                    )}
                    
                    {playing ? (
                        <div className="flex items-center space-x-2 relative z-10">
                             <div className="flex space-x-0.5 h-3 items-end">
                                <span className="w-0.5 bg-white animate-[bounce_1s_infinite] h-1/2"></span>
                                <span className="w-0.5 bg-white animate-[bounce_1.2s_infinite] h-full"></span>
                                <span className="w-0.5 bg-white animate-[bounce_0.8s_infinite] h-3/4"></span>
                                <span className="w-0.5 bg-white animate-[bounce_1.1s_infinite] h-2/3"></span>
                             </div>
                             <span className="font-bold text-[10px] uppercase tracking-widest">Transmitting...</span>
                        </div>
                    ) : (
                        <>
                             <svg className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <span className="font-bold text-[10px] uppercase tracking-widest relative z-10">Play_Audio_Briefing</span>
                        </>
                    )}
                </button>
            </>
        )}
      </div>
    </div>
  );
};