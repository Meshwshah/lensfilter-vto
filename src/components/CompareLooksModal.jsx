import React, { useState, useEffect, useRef } from 'react';
import { X, Columns, Grid, Check, Sparkles, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { FRAMES, LENS_TINTS } from '../data/framesData.js';
import { calculateFacePose } from '../vto/FaceMath.js';

export function CompareLooksModal({
  isOpen,
  onClose,
  capturedPhoto,
  photoLandmarks,
  onSelectFrame,
  currentFrame,
  onCapturePhoto,
  onUploadPhoto
}) {
  const [viewLayout, setViewLayout] = useState('2-way'); // '2-way' or '4-way'
  const fileInputRef = useRef(null);
  const [selectedFrames, setSelectedFrames] = useState([
    currentFrame || FRAMES[0],
    FRAMES[1],
    FRAMES[2],
    FRAMES[3]
  ]);

  useEffect(() => {
    if (currentFrame) {
      setSelectedFrames((prev) => [
        currentFrame,
        ...prev.filter((f) => f.id !== currentFrame.id).slice(0, 3)
      ]);
    }
  }, [currentFrame]);

  if (!isOpen) return null;

  const activeFrames = viewLayout === '2-way' ? selectedFrames.slice(0, 2) : selectedFrames.slice(0, 4);

  const handleFrameChange = (index, newFrame) => {
    setSelectedFrames((prev) => {
      const copy = [...prev];
      copy[index] = newFrame;
      return copy;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/90 gap-3">
          <div className="flex items-center justify-between sm:justify-start space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-100 flex items-center space-x-2">
                  <span>Compare Looks</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3D VTO
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-neutral-400 hidden xs:block">
                  Compare designer frames side-by-side on your face
                </p>
              </div>
            </div>

            {/* Mobile close button on top right */}
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Close Compare Looks"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
            {/* Layout Toggle */}
            <div className="flex items-center bg-neutral-800 p-1 rounded-xl border border-neutral-700/60">
              <button
                onClick={() => setViewLayout('2-way')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewLayout === '2-way'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side (2)</span>
              </button>
              <button
                onClick={() => setViewLayout('4-way')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewLayout === '4-way'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid (4)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="hidden sm:block p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Close Compare Looks"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950/60">
          {!capturedPhoto ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Compare Styles On Your Face</h3>
              <p className="text-xs text-neutral-400 max-w-md">
                Take a quick selfie or upload a portrait to see yourself wearing up to 4 different designer frames side-by-side!
              </p>
              <div className="flex items-center space-x-3 pt-2">
                {onCapturePhoto && (
                  <button
                    onClick={onCapturePhoto}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg transition-all"
                  >
                    <span>Take Selfie with Camera</span>
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-white/10 transition-all"
                >
                  <span>Upload Portrait</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewLayout === '2-way' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {activeFrames.map((frame, index) => (
                <CompareTile
                  key={`${frame.id}-${index}`}
                  frame={frame}
                  index={index}
                  capturedPhoto={capturedPhoto}
                  photoLandmarks={photoLandmarks}
                  onSelectThisFrame={() => {
                    onSelectFrame(frame);
                    onClose();
                  }}
                  onSwapFrame={(newFrame) => handleFrameChange(index, newFrame)}
                  isSelected={currentFrame?.id === frame.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 text-xs text-neutral-400">
          <span>Pro tip: Click any frame thumbnail below a photo to swap with another style.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
}

// Single Comparison Tile with Canvas Fitting
function CompareTile({
  frame,
  index,
  capturedPhoto,
  photoLandmarks,
  onSelectThisFrame,
  onSwapFrame,
  isSelected
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !capturedPhoto) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const render = () => {
      if (!isMounted) return;
      canvas.width = img.naturalWidth || 640;
      canvas.height = img.naturalHeight || 480;

      // Draw user face
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (photoLandmarks && photoLandmarks.length >= 468) {
        const pose = calculateFacePose(
          photoLandmarks,
          canvas.width,
          canvas.height,
          { videoWidth: canvas.width, videoHeight: canvas.height },
          frame
        );

        if (pose) {
          const frameImg = new Image();
          const drawGlasses = () => {
            if (!isMounted) return;
            ctx.save();

            // Transform to nasal bridge anchor point
            const anchorX = pose.anchorPixel.x;
            const anchorY = pose.anchorPixel.y;
            ctx.translate(anchorX, anchorY);
            ctx.rotate(pose.screenRoll !== undefined ? pose.screenRoll : -pose.rotation.z);

            const fw = pose.scale;
            const fh = fw / (frame.aspectRatio || 2.5);
            const opticalPupilYRatio = frame.opticalPupilYRatio !== undefined ? frame.opticalPupilYRatio : 0.38;

            // Subtle nose bridge contact shadow (strictly on nasal bridge)
            ctx.save();
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(0, 2, fw * 0.05, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            const drawX = -fw / 2;
            const drawY = -(opticalPupilYRatio * fh);

            // Draw optical lenses
            if (lensImg && lensImg.complete) {
              ctx.drawImage(lensImg, drawX, drawY, fw, fh);
            }

            // Draw high-resolution frame chassis
            ctx.drawImage(frameImg, drawX, drawY, fw, fh);

            ctx.restore();
          };

          const frameKey = frame.lensKey || frame.id.split('-')[0];
          const lensImg = new Image();
          lensImg.src = `/images/lenses/${frameKey}_clear.png`;

          frameImg.src = frame.frontChassis || frame.image;
          if (frameImg.complete) {
            drawGlasses();
          } else {
            frameImg.onload = drawGlasses;
          }
        }
      }
    };

    img.src = capturedPhoto;
    if (img.complete) {
      render();
    } else {
      img.onload = render;
    }

    return () => {
      isMounted = false;
    };
  }, [capturedPhoto, photoLandmarks, frame]);

  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden bg-neutral-900 border transition-all shadow-lg ${
        isSelected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Photo Viewport */}
      <div className="relative aspect-[3/4] w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
        {capturedPhoto ? (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500 space-y-2">
            <p className="text-sm font-medium text-neutral-400">Snap or upload a selfie first</p>
            <p className="text-xs">Take a photo in the main try-on to unlock side-by-side compare</p>
          </div>
        )}

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-amber-500 text-neutral-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Currently Active</span>
          </div>
        )}

        {/* Frame Name Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="text-sm font-bold text-white leading-tight">{frame.name}</p>
          <p className="text-xs text-amber-400 font-semibold">₹{frame.price.toLocaleString('en-IN')} • {frame.shape}</p>
        </div>
      </div>

      {/* Frame Selector & Action */}
      <div className="p-3 bg-neutral-900 space-y-2 border-t border-neutral-800">
        {/* Quick Style Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              onClick={() => onSwapFrame(f)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border transition ${
                f.id === frame.id
                  ? 'border-amber-500 ring-1 ring-amber-500'
                  : 'border-neutral-800 opacity-60 hover:opacity-100'
              }`}
              title={f.name}
            >
              <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Select Button */}
        <button
          onClick={onSelectThisFrame}
          className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            isSelected
              ? 'bg-neutral-800 text-amber-400 cursor-default'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
          }`}
        >
          <span>{isSelected ? 'Active Selection' : 'Select This Look'}</span>
          {!isSelected && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
