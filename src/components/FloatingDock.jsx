import React from 'react';
import { Camera, Sparkles, Sliders, Eye } from 'lucide-react';

export function FloatingDock({
  selectedFrame,
  isTryOnActive,
  onStartTryOn,
  onOpenCompareLooks,
  onToggleCustomizer
}) {
  if (!selectedFrame) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[94vw] px-4 py-2 rounded-full bg-[#121212]/85 backdrop-blur-2xl border border-amber-500/25 shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex items-center space-x-2 sm:space-x-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => onStartTryOn(selectedFrame)}
        className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95 transition-all whitespace-nowrap"
      >
        {isTryOnActive ? (
          <>
            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Studio Active</span>
          </>
        ) : (
          <>
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Try On Live (3D)</span>
          </>
        )}
      </button>

      {/* Compare Looks Button */}
      <button
        type="button"
        onClick={onOpenCompareLooks}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-full hover:bg-white/10 text-neutral-200 hover:text-white font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Compare</span>
        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">4</span>
      </button>

      {/* Customizer Drawer Button */}
      <button
        type="button"
        onClick={onToggleCustomizer}
        className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap"
      >
        <Sliders className="w-3.5 h-3.5 text-neutral-400" />
        <span>Fit & Lens</span>
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-5 bg-white/20" />

      {/* Current Selected Frame Specs & Price */}
      <div className="flex items-center space-x-2 pr-1 select-none">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 hidden lg:inline">
          Selected:
        </span>
        <span className="text-xs font-bold text-neutral-100 whitespace-nowrap">
          {selectedFrame.name}
        </span>
        <span className="text-xs font-extrabold text-amber-400 font-mono whitespace-nowrap">
          ₹{selectedFrame.price.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
