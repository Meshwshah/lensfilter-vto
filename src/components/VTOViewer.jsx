import React, { useRef, useState, useEffect } from 'react';
import { Camera, Sliders, Sparkles, RefreshCw, Upload, ArrowUp, ArrowDown, Plus, Minus, Check, SplitSquareVertical, Eye, X, Glasses, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';

export function VTOViewer({
  videoRef,
  canvasRef,
  isCameraActive,
  isFallbackMode,
  isTrackingFace,
  currentFrame,
  currentColor,
  currentLens,
  onCaptureSnapshot,
  onToggleCustomizer,
  onResetFit,
  onOpenFaceShapeModal,
  onOpenCompareLooks,
  splitProgress,
  onSplitChange,
  // Try-On Activation Props
  isTryOnActive,
  onStartTryOn,
  onStopTryOn,
  // Photo Fitting Mode Props
  mode,
  onSwitchMode,
  capturedPhoto,
  onCapturePhoto,
  onRetakePhoto,
  onUploadPhoto,
  microFit,
  onChangeMicroFit,
  // Instant Swapper & Color Props (Stitch Feature)
  frames,
  onSelectFrame,
  onSelectColor,
  lenses,
  onSelectLens
}) {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isLightingBoost, setIsLightingBoost] = useState(false);
  const [mobileDockTab, setMobileDockTab] = useState('frames'); // 'frames' | 'optics' on mobile

  // Handle Split Slider Dragging
  const handleSplitMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    onSplitChange(progress);
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDraggingSplit && e.touches[0]) {
        handleSplitMove(e.touches[0].clientX);
      }
    };
    const handleMouseMove = (e) => {
      if (isDraggingSplit) {
        handleSplitMove(e.clientX);
      }
    };
    const handleMouseUp = () => setIsDraggingSplit(false);

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Photo Countdown & Trigger
  const triggerPhotoCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFlashEffect(true);
          setTimeout(() => setFlashEffect(false), 300);
          onCapturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 900);
  };

  const handleSnapshotClick = () => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 250);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#e5e7eb']
    });

    onCaptureSnapshot();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Nudge Helpers
  const nudgeUp = () => {
    onChangeMicroFit({ ...microFit, offsetY: microFit.offsetY + 0.03 });
  };
  const nudgeDown = () => {
    onChangeMicroFit({ ...microFit, offsetY: microFit.offsetY - 0.03 });
  };
  const scaleUp = () => {
    onChangeMicroFit({ ...microFit, scale: Math.min(1.3, microFit.scale + 0.04) });
  };
  const scaleDown = () => {
    onChangeMicroFit({ ...microFit, scale: Math.max(0.7, microFit.scale - 0.04) });
  };

  return (
    <section className="w-full mb-10">
      {/* Hidden File Input for uploading selfie */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFileUpload(e);
          if (!isTryOnActive) onStartTryOn();
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* ========================================================= */}
        {/* LEFT COLUMN: EDITORIAL PRODUCT NARRATIVE & SPECS DOCK     */}
        {/* ========================================================= */}
        <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between space-y-6 glass-panel rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle living glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 z-10">
            {/* Top Eyebrow Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {currentFrame?.shape} Match 98%
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 text-[10px] uppercase tracking-wider font-semibold">
                Haute Optique SS/26
              </span>
            </div>

            {/* Title & Brand Headline */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 block mb-1">
                Signature Series // Bespoke Edition
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-neutral-100 font-normal tracking-tight">
                {currentFrame?.name}
              </h1>
              <p className="text-xs sm:text-sm italic text-amber-300/80 mt-1 font-light">
                {currentFrame?.subname}
              </p>
            </div>

            {/* Editorial Description */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              {currentFrame?.description}
            </p>

            {/* Specifications Chips (AccuFit Optics) */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-neutral-900/90 text-neutral-300 text-xs border border-white/5 font-mono">
                {currentFrame?.specs?.lensWidth || '51 mm'}□{currentFrame?.specs?.bridgeWidth || '19 mm'}-{currentFrame?.specs?.templeLength || '145 mm'}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-neutral-900/90 text-neutral-300 text-xs border border-white/5">
                {currentFrame?.specs?.weight || '14.2g'} Featherweight
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 font-medium">
                Zeiss AR Blue-Cut Included
              </span>
            </div>

            {/* Finish Selection Swatches */}
            {currentFrame?.colors && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Finish Selection</span>
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">{currentColor?.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {currentFrame.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectColor && onSelectColor(c)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        currentColor?.id === c.id
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-950 scale-110 border-white shadow-lg'
                          : 'border-white/20 opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lens Optics & Treatment Selector */}
            {lenses && lenses.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Lens Optics & Glaze</span>
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">{currentLens?.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lenses.map((l) => {
                    const isSelected = currentLens?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => onSelectLens && onSelectLens(l)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-sky-400 bg-sky-500/15 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                            : 'border-white/10 hover:border-white/25 bg-neutral-900/60 text-neutral-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={{
                            backgroundColor: l.colorHex,
                            boxShadow: `0 0 6px ${l.reflectionColorHex}66`
                          }}
                        />
                        <span>{l.name.split(' ')[0]}</span>
                        {l.isSunglasses ? (
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">SUN</span>
                        ) : (
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-sky-400/20 text-sky-300 font-mono">AR</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Primary Action Dock */}
          <div className="pt-4 border-t border-white/10 space-y-4 z-10">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-100 font-mono tracking-tight">
                  ₹{currentFrame?.price?.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-neutral-500 line-through font-mono">
                  ₹{Math.round(currentFrame?.price * 1.5).toLocaleString('en-IN')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  33% OFF
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Prescription ready in 48h • 14-day home audition
              </p>
            </div>

            {/* Launch Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {!isTryOnActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => onStartTryOn(currentFrame)}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>✨ Start 3D Virtual Try-On</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCompareLooks}
                    className="py-3.5 px-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-400/50 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Compare multiple looks side-by-side"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Compare</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onStopTryOn}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-amber-400" />
                    <span>Exit Try-On Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCompareLooks}
                    className="py-3.5 px-4 rounded-2xl bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Compare</span>
                  </button>
                </>
              )}
            </div>

            {/* Trust Reviews Line */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                ★ {currentFrame?.rating}
              </span>
              <span>•</span>
              <span>{currentFrame?.reviews} Client Fittings</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Zeiss Lab Certified</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE 3D VIRTUAL TRY-ON STUDIO STAGE  */}
        {/* ========================================================= */}
        <div className="order-1 lg:order-2 lg:col-span-7 relative h-[480px] sm:h-[540px] lg:h-auto lg:min-h-[580px] rounded-3xl overflow-hidden glass-panel border border-neutral-800/80 shadow-2xl flex items-center justify-center bg-neutral-950">
          <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden flex items-center justify-center">
            
            {/* Always mounted video and 3D canvas */}
            {mode === 'photo' && capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured Fitting Photo"
                className="absolute inset-0 w-full h-full object-cover filter brightness-102 contrast-102"
              />
            ) : (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-all duration-300 ${
                  isLightingBoost ? 'brightness-125 contrast-110 saturate-105' : 'brightness-105 contrast-102'
                } ${
                  isTryOnActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                playsInline
                webkit-playsinline="true"
                autoPlay
                muted
              />
            )}

            {/* Fallback Simulation Background */}
            {isFallbackMode && isTryOnActive && (!capturedPhoto || mode === 'live') && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 pointer-events-none">
                <div className="relative w-64 h-80 rounded-[45%] border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-200">Interactive 3D Simulation</p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                    Click "Start Camera" above to test on your own face!
                  </p>
                </div>
              </div>
            )}

            {/* Three.js 3D WebGL Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
                isTryOnActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* ===================================================== */}
            {/* STAGE A: SCULPTURAL PRODUCT SHOWCASE PODIUM (Browse)  */}
            {/* ===================================================== */}
            {!isTryOnActive && (
              <div
                onClick={() => onStartTryOn(currentFrame)}
                className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 cursor-pointer group"
              >
                {/* Ambient Radial Spotlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none" />

                {/* Top Podium Bar */}
                <div className="w-full flex items-center justify-between z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                    Sculptural Profile • Front Elevation
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                    <Eye className="w-3.5 h-3.5" /> 3D AR Ready
                  </span>
                </div>

                {/* Big HD Frame Artwork Photography */}
                <div className="relative w-full max-w-lg aspect-[16/10] my-auto flex items-center justify-center z-10">
                  <img
                    src={currentFrame?.image}
                    alt={currentFrame?.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Glowing Hover Hotspot Cue */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-amber-500/30 text-neutral-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <Camera className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                    <span>Tap to Try On Your Face in 3D</span>
                  </div>
                </div>

                {/* Bottom Specifications Footer */}
                <div className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400 border-t border-white/5 pt-3 z-10">
                  <span>Japanese Beta-Titanium</span>
                  <span className="text-amber-400 font-bold">AccuFit™ Biometric Calibrated</span>
                  <span>Made in Sabae, Japan</span>
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* STAGE B: VIRTUAL TRY-ON STUDIO CONTROLS (Active)      */}
            {/* ===================================================== */}
            {isTryOnActive && (
              <>
                {/* Flash & Countdown */}
                {flashEffect && (
                  <div className="absolute inset-0 bg-white/90 z-50 transition-opacity duration-300 pointer-events-none" />
                )}
                {countdown !== null && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
                    <div className="w-24 h-24 rounded-full bg-neutral-950/80 border-2 border-amber-400 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                      <span className="text-4xl font-black text-amber-400 animate-ping font-mono">{countdown}</span>
                    </div>
                  </div>
                )}

                {/* Oval Face Guide when in Photo Mode without captured photo */}
                {mode === 'photo' && !capturedPhoto && (
                  <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center p-6">
                    <div className="w-56 h-72 rounded-[48%] border-2 border-dashed border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-neutral-950/80 px-3 py-1 rounded-full border border-amber-400/30">
                        Align Face Here
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 bg-neutral-950/80 px-4 py-1.5 rounded-full border border-white/10 mt-3 shadow-lg">
                      Look straight forward in good lighting
                    </p>
                  </div>
                )}

                {/* Split Before / After Divider */}
                {splitProgress < 0.98 && (
                  <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-auto cursor-ew-resize select-none touch-none"
                    style={{ left: `${splitProgress * 100}%`, transform: 'translateX(-50%)' }}
                    onMouseDown={() => setIsDraggingSplit(true)}
                    onTouchStart={() => setIsDraggingSplit(true)}
                  >
                    <div className="w-0.5 h-full bg-gradient-to-b from-amber-400 via-white to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 px-2 py-0.5 rounded-full glass-dock border border-amber-400/60 shadow-lg text-[9px] font-bold tracking-wider text-amber-200 whitespace-nowrap flex items-center space-x-1">
                      <span>NATURAL</span>
                      <span className="text-amber-400 font-mono">|</span>
                      <span>TRY-ON</span>
                    </div>
                  </div>
                )}

                {/* Top Controls Bar: Mesh Status (Left), Mode Switcher (Center), Controls (Right) */}
                <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-30 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
                  {/* Left: Biometric Mesh Status */}
                  <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-emerald-500/30 shadow-lg shrink-0 pointer-events-auto">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono hidden sm:inline">
                      {isTrackingFace ? 'FACE MESH LOCKED • 468 NODES' : 'ALIGN FACE IN CAMERA'}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 font-mono sm:hidden">
                      {isTrackingFace ? '468 NODES' : 'ALIGN FACE'}
                    </span>
                  </div>

                  {/* Center: Mode Switcher Pill */}
                  <div className="flex items-center glass-dock p-1 rounded-2xl border border-white/15 shadow-2xl pointer-events-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onSwitchMode('photo')}
                      className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                        mode === 'photo'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="text-[11px] sm:text-xs">Photo</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-950/20 uppercase font-extrabold tracking-wider hidden sm:inline">
                        HD
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchMode('live')}
                      className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                        mode === 'live'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px] sm:text-xs">Live</span>
                    </button>
                  </div>

                  {/* Right: Lighting Boost, Retake, Exit */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsLightingBoost(!isLightingBoost)}
                      className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center space-x-1 ${
                        isLightingBoost
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-amber-500/30'
                          : 'glass-panel border-white/15 text-neutral-200 hover:text-white'
                      }`}
                      title="Toggle Studio Lighting Boost"
                    >
                      <Sun className={`w-3.5 h-3.5 ${isLightingBoost ? 'text-neutral-950' : 'text-amber-400'}`} />
                      <span className="hidden md:inline">Boost</span>
                    </button>

                    {mode === 'photo' && capturedPhoto && (
                      <button
                        type="button"
                        onClick={onRetakePhoto}
                        className="flex items-center space-x-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl glass-panel border border-white/10 hover:border-amber-400 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-md active:scale-95"
                        title="Retake selfie photo"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Retake</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onStopTryOn}
                      className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/90 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-neutral-300 hover:text-white text-xs font-semibold transition-all shadow-md flex items-center space-x-1"
                      title="Close camera and return to catalog"
                    >
                      <X className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Exit</span>
                    </button>
                  </div>
                </div>

                {/* Center Photo Mode Capture Buttons (When no photo captured yet) */}
                {mode === 'photo' && !capturedPhoto && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3 pointer-events-auto">
                    <button
                      type="button"
                      onClick={triggerPhotoCountdown}
                      className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 stroke-[2.5]" />
                      <span>Take Selfie Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-3 rounded-2xl glass-panel border border-white/15 hover:border-amber-400 text-neutral-200 hover:text-white font-semibold text-xs transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Upload</span>
                    </button>
                  </div>
                )}

                {/* Micro-Nudge Calibration Controls (When Photo is Captured) */}
                {mode === 'photo' && capturedPhoto && (
                  <div className="absolute top-16 right-4 z-20 pointer-events-auto">
                    <div className="glass-dock px-2 py-1 rounded-xl border border-white/10 flex items-center space-x-1 shadow-lg text-neutral-300">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-1 hidden sm:inline">
                        Fit:
                      </span>
                      <button type="button" onClick={nudgeUp} className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white" title="Move Up">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={nudgeDown} className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white" title="Move Down">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3 bg-white/10" />
                      <button type="button" onClick={scaleDown} className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white" title="Shrink">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={scaleUp} className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white" title="Expand">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3 bg-white/10" />
                      <button type="button" onClick={onResetFit} className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-amber-400" title="Reset Fit">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* DESKTOP (sm+): Stacked Optics Bar + Frame Swapper */}
                {(mode === 'live' || capturedPhoto) && lenses && lenses.length > 0 && (
                  <div className="hidden sm:flex absolute bottom-28 sm:bottom-30 left-1/2 -translate-x-1/2 z-20 items-center space-x-1.5 px-2.5 py-1 rounded-2xl glass-dock border border-white/10 shadow-xl max-w-[92%] overflow-x-auto scrollbar-none pointer-events-auto">
                    <span className="text-[9px] uppercase font-bold text-sky-400 tracking-wider px-1">
                      Optics:
                    </span>
                    {lenses.map((l) => {
                      const isActive = l.id === currentLens?.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => onSelectLens && onSelectLens(l)}
                          className={`px-2 py-0.5 rounded-xl text-[10px] font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
                            isActive
                              ? 'bg-sky-400 text-neutral-950 font-bold shadow-md shadow-sky-400/25 scale-105'
                              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: l.colorHex }}
                          />
                          <span>{l.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(mode === 'live' || capturedPhoto) && frames && frames.length > 0 && (
                  <div className="hidden sm:flex absolute bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 z-20 items-center space-x-1.5 px-3 py-1.5 rounded-2xl glass-dock border border-white/10 shadow-2xl max-w-[94%] overflow-x-auto scrollbar-none pointer-events-auto">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider px-1">
                      Quick Swap:
                    </span>
                    {frames.map((f) => {
                      const isActive = f.id === currentFrame?.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onSelectFrame && onSelectFrame(f)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap active:scale-95 ${
                            isActive
                              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/25 scale-105'
                              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <span className="text-[11px]">{f.name.split(' ')[0]}</span>
                          <span className={`text-[10px] font-mono ${isActive ? 'text-neutral-950 font-black' : 'text-amber-400 font-semibold'}`}>
                            ₹{f.price.toLocaleString('en-IN')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MOBILE (< sm): Unified Single-Row Dock with Tab Toggle (Frames vs Optics) */}
                {(mode === 'live' || capturedPhoto) && (
                  <div className="sm:hidden absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-2 py-1 rounded-2xl glass-dock border border-white/15 shadow-2xl max-w-[95%] overflow-x-auto scrollbar-none pointer-events-auto">
                    {/* Mini Toggle Pill */}
                    <div className="flex items-center bg-black/60 p-0.5 rounded-xl border border-white/10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMobileDockTab('frames')}
                        className={`p-1 rounded-lg transition-all ${
                          mobileDockTab === 'frames'
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Frame Styles"
                      >
                        <Glasses className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileDockTab('optics')}
                        className={`p-1 rounded-lg transition-all ${
                          mobileDockTab === 'optics'
                            ? 'bg-sky-400 text-neutral-950 shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Lens Optics"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content: Either Frames or Lenses */}
                    {mobileDockTab === 'frames' && frames && (
                      <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                        {frames.map((f) => {
                          const isActive = f.id === currentFrame?.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => onSelectFrame && onSelectFrame(f)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap active:scale-95 ${
                                isActive
                                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/25'
                                  : 'bg-neutral-900/60 text-neutral-300'
                              }`}
                            >
                              <span>{f.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {mobileDockTab === 'optics' && lenses && (
                      <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                        {lenses.map((l) => {
                          const isActive = l.id === currentLens?.id;
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => onSelectLens && onSelectLens(l)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 whitespace-nowrap active:scale-95 ${
                                isActive
                                  ? 'bg-sky-400 text-neutral-950 font-bold shadow-md shadow-sky-400/25'
                                  : 'bg-neutral-900/60 text-neutral-300'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                                style={{ backgroundColor: l.colorHex }}
                              />
                              <span>{l.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Studio Action Bar (Responsive Mobile & Desktop) */}
                {(mode === 'live' || capturedPhoto) && (
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 sm:space-x-3 pointer-events-auto max-w-[96%]">
                    <button
                      type="button"
                      onClick={onOpenCompareLooks}
                      className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-95 transition-all shrink-0"
                    >
                      <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                      <span className="hidden xs:inline sm:inline">Compare</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSplitChange(splitProgress < 0.98 ? 1.0 : 0.5)}
                      className={`p-1.5 sm:px-3 sm:py-2 rounded-2xl glass-panel border transition-all shadow-lg flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold ${
                        splitProgress < 0.98
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                          : 'border-white/10 hover:border-white/20 text-neutral-300 hover:text-white'
                      }`}
                      title="Split Before / After View"
                    >
                      <SplitSquareVertical className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
                      <span className="hidden sm:inline">Split</span>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleCustomizer}
                      className="p-1.5 sm:px-3 sm:py-2 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-amber-300 transition-all shadow-lg flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold"
                      title="Customize Fit & Optics"
                    >
                      <Sliders className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
                      <span className="hidden sm:inline">Fit & Lenses</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSnapshotClick}
                      className="p-1.5 sm:px-3 sm:py-2 rounded-2xl glass-panel border border-white/10 hover:border-amber-400 text-neutral-300 hover:text-white transition-all shadow-lg flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold"
                      title="Save HD Snapshot"
                    >
                      <Camera className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
                      <span className="hidden sm:inline">Snapshot</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
