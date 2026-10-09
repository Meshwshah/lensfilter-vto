import React from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function FaceShapeModal({
  isOpen,
  onClose,
  faceShapeData,
  frames,
  onSelectFrame
}) {
  if (!isOpen || !faceShapeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel bg-neutral-950/95 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-luxury font-bold text-lg text-white">
              AI Face Geometry Analysis
            </h3>
            <span className="text-xs text-amber-400 font-semibold tracking-wide">
              {faceShapeData.title}
            </span>
          </div>
        </div>

        {/* Advice Card */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-neutral-200 leading-relaxed">
            {faceShapeData.advice}
          </p>
        </div>

        {/* Facial Landmark Metrics */}
        {faceShapeData.metrics && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Length / Width</span>
              <span className="font-mono text-sm font-bold text-amber-400">{faceShapeData.metrics.lengthToWidth}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Jaw Proportion</span>
              <span className="font-mono text-sm font-bold text-amber-400">{faceShapeData.metrics.jawToCheek}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Brow Ratio</span>
              <span className="font-mono text-sm font-bold text-amber-400">{faceShapeData.metrics.foreheadToCheek}</span>
            </div>
          </div>
        )}

        {/* Curated Recommendations */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
            Top Curated Styles For You
          </h4>

          <div className="space-y-2">
            {frames
              .filter((f) => faceShapeData.bestFrames.includes(f.shape))
              .map((frame) => (
                <div
                  key={frame.id}
                  onClick={() => {
                    onSelectFrame(frame);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {frame.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {frame.shape} • {frame.subname}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 font-mono">
                    <span>₹{frame.price.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-5 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
