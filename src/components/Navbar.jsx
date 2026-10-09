import React from 'react';
import { Camera, Sparkles, ShieldCheck, Eye, VideoOff, RefreshCw } from 'lucide-react';

export function Navbar({
  isCameraActive,
  isFallbackMode,
  onToggleCamera,
  faceShapeData,
  onOpenFaceShapeModal,
  onOpenLegalModal,
  onOpenCompareLooks
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-2 sm:px-6 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 shadow-2xl">
        {/* Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-white/20 shrink-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-luxury font-bold text-base sm:text-lg tracking-wider text-neutral-100">
                SPECTA<span className="text-amber-400">AR</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Physically-Based 3D Eyewear Virtual Try-On
            </p>
          </div>
        </div>

        {/* Status / Actions indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Lenskart Compare Looks Button */}
          <button
            onClick={onOpenCompareLooks}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            title="Compare multiple frames side by side"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Compare</span>
          </button>

          {faceShapeData && (
            <button
              onClick={onOpenFaceShapeModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all group hidden sm:flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Face: <strong className="text-neutral-100">{faceShapeData.shape}</strong></span>
            </button>
          )}

          {/* Camera / Demo Switcher */}
          <button
            onClick={onToggleCamera}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isCameraActive && !isFallbackMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
            }`}
            title={isCameraActive ? 'Switch to Demo Simulation Mode' : 'Activate Live Camera'}
          >
            {isCameraActive && !isFallbackMode ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Live Camera</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Camera</span>
              </>
            )}
          </button>

          {/* Patent / Freedom-to-Operate Advisor */}
          <button
            onClick={onOpenLegalModal}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700/80 transition-all hover:border-amber-500/40 hover:text-amber-200"
            title="Read Freedom-to-Operate & Patent Analysis"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Patent & IP Clear</span>
          </button>
        </div>
      </div>
    </header>
  );
}
