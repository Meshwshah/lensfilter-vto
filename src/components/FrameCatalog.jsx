import React, { useState } from 'react';
import { Star, Sparkles, Check, Glasses, Eye, ChevronRight } from 'lucide-react';

export function FrameCatalog({
  frames,
  selectedFrame,
  onSelectFrame,
  onStartTryOn,
  isTryOnActive,
  faceShapeData
}) {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Navigator', 'Aviator', 'Square', 'Round', 'Clubmaster', 'Geometric', 'Cat-Eye', 'Rimless'];

  const filteredFrames = activeFilter === 'All'
    ? frames
    : frames.filter((f) => f.shape.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section className="mt-8 w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-2 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-2">
              <Glasses className="w-5 h-5 text-amber-400" />
              <span>Designer Eyewear Collection</span>
            </h2>
            <span className="text-xs text-neutral-400 font-normal">
              ({frames.length} Handcrafted Styles)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select any pair to inspect details or preview instantly on your face in realistic 3D AR
          </p>
        </div>

        {faceShapeData && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Best match for your <strong className="text-white capitalize">{faceShapeData.shape}</strong> face
            </span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-2 px-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === cat
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-white/5 hover:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Frame cards grid (Responsive 4 columns for 8 frames) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFrames.map((frame) => {
          const isSelected = selectedFrame?.id === frame.id;
          const isRecommended = faceShapeData?.bestFrames?.includes(frame.shape);

          return (
            <div
              key={frame.id}
              onClick={() => {
                onSelectFrame(frame);
                if (window.innerWidth < 1024) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-300 text-left flex flex-col justify-between ${
                isSelected
                  ? 'glass-panel-gold shadow-xl shadow-amber-500/15 -translate-y-1 border-amber-500/50'
                  : 'glass-panel hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-md">
                  {frame.shape}
                </span>

                {isRecommended ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-bold text-neutral-950 shadow-sm flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Match</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {frame.badge}
                  </span>
                )}
              </div>

              {/* Title & Specs */}
              <div>
                <div className="flex items-start justify-between mt-1">
                  <h3 className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                    {frame.name}
                  </h3>
                  <span className="text-sm font-extrabold text-amber-300 font-mono">
                    ₹{frame.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {frame.subname}
                </p>

                {/* Eyewear Real Product Photograph */}
                <div className="relative w-full aspect-[16/11] my-3 rounded-xl overflow-hidden bg-neutral-950/80 border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 transition-all">
                  <img
                    src={frame.image}
                    alt={frame.name}
                    className="w-full h-full object-contain p-2 filter brightness-105 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Bottom: Rating, Color swatches and Try on Action */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-neutral-200 font-semibold">{frame.rating}</span>
                    <span className="text-[10px] text-neutral-400">({frame.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {frame.colors.map((c) => (
                      <span
                        key={c.id}
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Try On Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFrame(frame);
                    if (onStartTryOn) onStartTryOn(frame);
                    if (window.innerWidth < 1024) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md ${
                    isSelected && isTryOnActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 hover:shadow-amber-500/25 active:scale-95'
                  }`}
                >
                  {isSelected && isTryOnActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Currently Trying On</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Try On in 3D (AR)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
