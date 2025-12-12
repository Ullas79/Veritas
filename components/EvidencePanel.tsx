import React, { useRef, useState, useEffect } from "react";
import { VisualHotspot, RealitySubtext } from "../types";

interface EvidencePanelProps {
  file: File | null;
  onFileUpload: (file: File) => void;
  onReset: () => void;
  hotspots: VisualHotspot[] | null;
  realitySubtext: RealitySubtext[] | null;
  extractedText: string | null;
  showRealityLens: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  file,
  onFileUpload,
  onReset,
  hotspots,
  realitySubtext,
  extractedText,
  showRealityLens,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropSuccess, setIsDropSuccess] = useState(false);

  // State to track exact rendered dimensions of the media for precise overlay alignment
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Reset dimensions when file changes
      setMediaDimensions(null);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      setMediaDimensions(null);
    }
  }, [file]);

  // Update dimensions on load and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mediaRef.current) {
        setMediaDimensions({
          width: mediaRef.current.clientWidth,
          height: mediaRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    
    // Also use ResizeObserver for more robust tracking of element size changes
    const observer = new ResizeObserver(() => {
        updateDimensions();
    });
    
    if (mediaRef.current) {
        observer.observe(mediaRef.current);
    }

    return () => {
        window.removeEventListener("resize", updateDimensions);
        observer.disconnect();
    };
  }, [previewUrl]);

  const handleMediaLoad = () => {
    if (mediaRef.current) {
      setMediaDimensions({
        width: mediaRef.current.clientWidth,
        height: mediaRef.current.clientHeight,
      });
    }
  };

  const validateAndUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith("image/") && !uploadedFile.type.startsWith("video/")) {
      alert("Please upload a valid image or video file.");
      return;
    }
    onFileUpload(uploadedFile);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              validateAndUpload(blob);
              e.preventDefault();
            }
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setIsDropSuccess(true);
      setTimeout(() => {
        setIsDropSuccess(false);
        validateAndUpload(droppedFile);
      }, 600);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const triggerInput = () => fileInputRef.current?.click();

  let containerClasses = "group flex-1 border border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden backdrop-blur-sm ";
  
  if (isDropSuccess) {
      containerClasses += "border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]";
  } else if (isDragging) {
      containerClasses += "border-blue-500 bg-blue-500/10 shadow-[inset_0_0_30px_rgba(59,130,246,0.2)]";
  } else {
      containerClasses += "border-slate-700 bg-slate-900/30 hover:border-blue-500/50 hover:bg-slate-800/40";
  }

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden transition-all border border-white/5 relative bg-[#050505]">
      {/* Scanlines Overlay - CRT feel */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-20 opacity-20"></div>

      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl z-30 flex-none">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center font-mono">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Evidence_Feed // LIVE
        </h2>
        {file && (
          <button
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.value = "";
              onReset();
            }}
            className="text-[9px] font-mono uppercase tracking-wider text-slate-500 hover:text-white bg-white/5 hover:bg-red-500/20 px-2 py-1 rounded transition-all border border-white/5 hover:border-red-500/30"
          >
            Purge_Data
          </button>
        )}
      </div>

      <div className={`flex-1 relative flex flex-col p-6 overflow-hidden transition-colors duration-700 ${showRealityLens ? "bg-black" : "bg-slate-950/50"}`}>
        {/* Decorative Rulers for "Pro" feel */}
        <div className="absolute top-12 left-2 bottom-4 w-4 border-r border-white/5 flex flex-col justify-between py-2 z-10 opacity-50 pointer-events-none">
           {[...Array(10)].map((_,i) => <div key={i} className="w-2 h-px bg-white/20"></div>)}
        </div>
        <div className="absolute top-12 left-6 right-4 h-4 border-b border-white/5 flex justify-between px-2 z-10 opacity-50 pointer-events-none">
           {[...Array(20)].map((_,i) => <div key={i} className="h-2 w-px bg-white/20"></div>)}
        </div>

        {showRealityLens && <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>}
        
        {!previewUrl ? (
          <div
            className={containerClasses + " m-4 ml-8 mt-8"}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerInput}
          >
             {/* Crosshair Background */}
             <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDragging ? "opacity-100" : "opacity-30"}`}>
               <div className="absolute top-1/2 left-1/2 w-full h-px bg-blue-500/20 transform -translate-x-1/2"></div>
               <div className="absolute top-1/2 left-1/2 w-px h-full bg-blue-500/20 transform -translate-y-1/2"></div>
               <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-blue-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
             </div>

            <div className={`w-16 h-16 rounded-sm flex items-center justify-center mb-4 transition-all duration-300 border backdrop-blur-md ${
                isDropSuccess 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : isDragging 
                        ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                        : "bg-slate-900/60 border-slate-700 text-slate-500 group-hover:border-blue-500/50 group-hover:text-blue-400"
            }`}>
               {isDropSuccess ? (
                   <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                   </svg>
               ) : (
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                   </svg>
               )}
            </div>
            
            <div className="z-10 text-center">
                <h3 className={`text-sm font-bold uppercase tracking-[0.2em] mb-2 transition-colors duration-300 font-mono ${
                    isDropSuccess ? "text-emerald-400" : isDragging ? "text-blue-400" : "text-slate-300"
                }`}>
                    {isDropSuccess ? "Data_Inbound" : isDragging ? "Acquire_Target" : "Input_Media"}
                </h3>
                <div className="flex space-x-2 justify-center mt-2">
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">JPG</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">PNG</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">MP4</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 w-full">
            {/* Main Image Display Container */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center p-4">
                <div className="relative flex items-center justify-center" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                    {/* Media Element - Intrinsic size bounded by container */}
                    <div className={`relative transition-all duration-700 ${showRealityLens ? "brightness-[0.4] contrast-125 saturate-0" : ""}`}>
                    {file?.type.startsWith("video/") ? (
                        <video 
                            ref={mediaRef as React.RefObject<HTMLVideoElement>}
                            src={previewUrl} 
                            controls 
                            className="max-w-full max-h-[55vh] object-contain block border border-white/10 bg-black"
                            onLoadedMetadata={handleMediaLoad}
                        />
                    ) : (
                        <img
                        ref={mediaRef as React.RefObject<HTMLImageElement>}
                        src={previewUrl}
                        alt="Evidence"
                        className="max-w-full max-h-[55vh] object-contain block h-auto w-auto border border-white/10 bg-black"
                        onLoad={handleMediaLoad}
                        />
                    )}
                    
                    {/* Scanning Line Effect attached to image wrapper */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        <div className="w-full h-[1px] bg-blue-500/50 shadow-[0_0_15px_#3b82f6] animate-[scan_4s_linear_infinite] opacity-50"></div>
                    </div>
                    </div>
                    
                    {/* OVERLAYS CONTAINER - Exactly sized to the media element via JS */}
                    {mediaDimensions && (
                        <div 
                            className="absolute pointer-events-none z-20"
                            style={{
                                width: mediaDimensions.width,
                                height: mediaDimensions.height,
                            }}
                        >
                            {/* Image Grid Overlay (Always faint) */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10"></div>

                            {/* Corner Markers */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/30 z-20"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/30 z-20"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/30 z-20"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/30 z-20"></div>


                            {/* Hotspots - refined to brackets */}
                            {hotspots && !showRealityLens && (
                            <div className="absolute inset-0 pointer-events-none">
                                {hotspots.map((h, idx) => (
                                <div
                                    key={idx}
                                    className="absolute z-20 group animate-scale-up"
                                    style={{
                                        left: `${h.x * 100}%`,
                                        top: `${h.y * 100}%`,
                                        width: `${h.width * 100}%`,
                                        height: `${h.height * 100}%`,
                                        animationDelay: `${idx * 150}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    {/* Brackets */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                                    
                                    {/* Hover fill */}
                                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* Label */}
                                    <div className="absolute -top-6 left-0 bg-yellow-500 text-black px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wide opacity-80">
                                        ARTIFACT_{idx+1}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}

                            {/* Reality Lens Overlay - Refined for clarity */}
                            {showRealityLens && realitySubtext && (
                            <div className="absolute inset-0 pointer-events-none z-30">
                                {realitySubtext.map((sub, idx) => (
                                    <div
                                        key={`subtext-${idx}`}
                                        className="absolute animate-in zoom-in duration-300"
                                        style={{
                                            left: `${sub.x * 100}%`,
                                            top: `${sub.y * 100}%`,
                                            width: `${sub.width * 100}%`,
                                            height: `${sub.height * 100}%`,
                                            animationDelay: `${idx * 150}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <div className="relative w-full h-full border border-red-500/80 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                            {/* Label Tag */}
                                            <div className="absolute -top-4 -left-px flex items-center bg-red-600 text-white px-1.5 py-0.5 text-[8px] font-mono tracking-widest uppercase shadow-md">
                                                TRUTH_{idx + 1}
                                            </div>

                                            {/* Text */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-auto min-w-[120px] max-w-[300px] z-50">
                                                <div className="bg-black/80 text-red-100 text-center text-xs px-2 py-1 font-mono border border-red-500/30 shadow-xl backdrop-blur-md whitespace-normal leading-tight">
                                                    {sub.translation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hover instruction */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <button 
                    onClick={triggerInput}
                    className="bg-slate-900/90 text-blue-400 text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                    >
                        Switch_Source
                    </button>
                </div>
            </div>
            
            {/* OCR Extracted Text Section */}
            {extractedText && (
                <div className="flex-none mt-2 border-t border-white/10 pt-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 font-mono flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        OCR_Text_Extraction
                    </h3>
                    <div className="bg-black/50 border border-white/5 p-3 rounded text-xs font-mono text-emerald-400/80 max-h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/30 shadow-inner">
                        {extractedText}
                    </div>
                </div>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleChange}
          accept="image/*,video/*"
        />
      </div>
    </div>
  );
};