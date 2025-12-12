import React, { useState, useEffect, useRef } from 'react';
import { JuryResult, JuryMessage } from '../types';

interface AgenticJuryProps {
  result: JuryResult | null;
  loading: boolean;
}

export const AgenticJury: React.FC<AgenticJuryProps> = ({ result, loading }) => {
  const [visibleMessages, setVisibleMessages] = useState<JuryMessage[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      setVisibleMessages([]);
      setShowVerdict(false);
      return;
    }

    if (result && result.chat) {
      const messages = result.chat;
      setVisibleMessages([]);
      setShowVerdict(false);

      let delay = 0;
      messages.forEach((msg, index) => {
        delay += 1200; // Delay between messages
        setTimeout(() => {
          setVisibleMessages(prev => [...prev, msg]);
          // Scroll to bottom
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, delay);
      });

      // Show verdict after all messages
      setTimeout(() => {
        setShowVerdict(true);
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, delay + 1500);
    }
  }, [result, loading]);

  const getBotStyle = (speaker: string) => {
    switch (speaker) {
      case 'Visual Forensics Bot':
        return {
          borderColor: 'border-l-blue-500',
          textColor: 'text-blue-400',
          title: 'VISUAL_FORENSICS',
          glow: 'shadow-[0_0_10px_rgba(59,130,246,0.1)]'
        };
      case 'Legal Bot':
        return {
          borderColor: 'border-l-yellow-500',
          textColor: 'text-yellow-400',
          title: 'LEGAL_COMPLIANCE',
          glow: 'shadow-[0_0_10px_rgba(234,179,8,0.1)]'
        };
      case 'Psychology Bot':
        return {
          borderColor: 'border-l-pink-500',
          textColor: 'text-pink-400',
          title: 'PSYCH_ANALYSIS',
          glow: 'shadow-[0_0_10px_rgba(236,72,153,0.1)]'
        };
      default:
        return {
          borderColor: 'border-l-slate-500',
          textColor: 'text-slate-400',
          title: 'SYSTEM_BOT',
          glow: ''
        };
    }
  };

  if (loading) return null;
  if (!result) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900/30 rounded-lg border border-white/5 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20">
         <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-2"></span>
            Live_Jury_Feed
         </h3>
         <span className="text-[9px] text-slate-600 font-mono tracking-wider">ENCRYPTED // CH: 884-X</span>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {visibleMessages.map((msg, idx) => {
            const style = getBotStyle(msg.speaker);
            return (
                <div key={idx} className={`flex flex-col animate-in slide-in-from-left-4 duration-300 fade-in`}>
                    <div className="flex items-center space-x-2 mb-1 opacity-80">
                        <span className={`text-[10px] font-mono font-bold ${style.textColor} tracking-wider`}>
                             {'>'} {style.title}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className={`
                        pl-3 py-2 pr-2 border-l-2 ${style.borderColor} bg-slate-800/30 
                        text-xs leading-relaxed text-slate-300 font-mono shadow-sm backdrop-blur-sm
                        ${style.glow}
                    `}>
                        {msg.message_text}
                    </div>
                </div>
            )
        })}

        {showVerdict && result.final_verdict && (
            <div className="mt-8 mb-2 animate-in zoom-in duration-500 fade-in">
                <div className={`
                    relative p-5 rounded-sm border-2
                    ${result.final_verdict.consensus_level.includes('disagreement') ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-emerald-500/50 bg-emerald-500/5'}
                    backdrop-blur-md shadow-2xl
                `}>
                    {/* Stamp Effect */}
                    <div className={`
                        absolute -top-3 right-4 px-2 py-1 border-2 text-[10px] font-black uppercase tracking-widest transform rotate-2 bg-slate-950
                        ${result.final_verdict.consensus_level.includes('disagreement') ? 'border-yellow-500 text-yellow-500' : 'border-emerald-500 text-emerald-500'}
                    `}>
                        {result.final_verdict.consensus_level}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-widest border-b border-white/10 pb-2">
                        Final Jury Verdict
                    </h4>
                    
                    <p className="text-sm text-white mb-4 font-medium leading-relaxed font-sans">
                        {result.final_verdict.summary}
                    </p>
                    
                    <div className="space-y-1.5">
                        {result.final_verdict.supporting_points.map((point, i) => (
                            <div key={i} className="text-xs text-slate-400 flex items-start font-mono">
                                <span className={`mr-2 mt-0.5 text-[10px] ${result.final_verdict.consensus_level.includes('disagreement') ? 'text-yellow-500' : 'text-emerald-500'}`}>[+]</span>
                                {point}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};