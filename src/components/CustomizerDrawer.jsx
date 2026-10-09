import React from 'react';
import { X, Sliders, Palette, Glasses, ShieldCheck, Ruler } from 'lucide-react';
import { LENS_TINTS } from '../data/framesData.js';

export function CustomizerDrawer({
  isOpen,
  onClose,
  selectedFrame,
  selectedColor,
  onSelectColor,
  selectedLens,
  onSelectLens,
  microFit,
  onChangeMicroFit,
  onResetMicroFit
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel bg-neutral-950/95 border-l border-neutral-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-luxury font-bold text-lg text-white">Custom Atelier & Fit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Frame Material & Finish */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Palette className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Frame Finish ({selectedFrame.colors.length} Finishes)
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {selectedFrame.colors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => onSelectColor(color)}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-white/5 hover:border-white/15 bg-neutral-900/60 text-neutral-300'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-white/20 shadow-md shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold block truncate">{color.name}</span>
                    <span className="text-[10px] text-neutral-400">
                      {color.metalness > 0.5 ? 'PBR Metallic' : 'Polished Acetate'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Lens Optics & Tints */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Glasses className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Lens Treatment & Optics
            </h4>
          </div>

          <div className="space-y-2">
            {LENS_TINTS.map((lens) => {
              const isSelected = selectedLens?.id === lens.id;
              return (
                <button
                  key={lens.id}
                  onClick={() => onSelectLens(lens)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-white/5 hover:border-white/15 bg-neutral-900/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
                      style={{
                        backgroundColor: lens.colorHex,
                        boxShadow: `0 0 8px ${lens.reflectionColorHex}55`
                      }}
                    />
                    <div>
                      <span className="text-xs font-bold block">{lens.name}</span>
                      <span className="text-[10px] text-neutral-400">{lens.subname}</span>
                    </div>
                  </div>
                  {lens.isSunglasses ? (
                    <span className="text-[10px] uppercase font-semibold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10">
                      Sun / UV400
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-semibold text-sky-400 px-2 py-0.5 rounded bg-sky-400/10">
                      Anti-Glare
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Micro-Fit Calibration */}
        <div className="mt-6 p-4 rounded-2xl glass-panel border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Fit Calibration (PD & Position)
              </h4>
            </div>
            <button
              onClick={onResetMicroFit}
              className="text-[10px] text-amber-400 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Scale / Frame Width */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-300">Frame Scale / Width</span>
                <span className="text-amber-400 font-mono text-xs">{microFit.scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.82"
                max="1.25"
                step="0.01"
                value={microFit.scale}
                onChange={(e) => onChangeMicroFit({ ...microFit, scale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>Narrow Face</span>
                <span>Standard</span>
                <span>Wide Face</span>
              </div>
            </div>

            {/* Nose Bridge Height */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-300">Nose Bridge Height</span>
                <span className="text-amber-400 font-mono text-xs">{(microFit.offsetY * 100).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min="-0.15"
                max="0.15"
                step="0.01"
                value={microFit.offsetY}
                onChange={(e) => onChangeMicroFit({ ...microFit, offsetY: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>Lower on Nose</span>
                <span>Higher</span>
              </div>
            </div>

            {/* Pantoscopic Tilt */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-300">Pantoscopic Tilt</span>
                <span className="text-amber-400 font-mono text-xs">{((microFit.tilt * 180) / Math.PI).toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.01"
                value={microFit.tilt}
                onChange={(e) => onChangeMicroFit({ ...microFit, tilt: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Technical Specs */}
        <div className="mt-5 p-4 rounded-xl bg-neutral-900/50 border border-white/5 text-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
            Frame Geometry Specifications
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-neutral-950/60">
              <span className="text-[10px] text-neutral-400 block">Lens Width</span>
              <span className="font-bold text-white">{selectedFrame.specs.lensWidth}</span>
            </div>
            <div className="p-2 rounded bg-neutral-950/60">
              <span className="text-[10px] text-neutral-400 block">Bridge Width</span>
              <span className="font-bold text-white">{selectedFrame.specs.bridgeWidth}</span>
            </div>
            <div className="p-2 rounded bg-neutral-950/60">
              <span className="text-[10px] text-neutral-400 block">Temple</span>
              <span className="font-bold text-white">{selectedFrame.specs.templeLength}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-6 border-t border-white/10 mt-6">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          Confirm Customizations
        </button>
      </div>
    </div>
  );
}
