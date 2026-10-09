import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FRAMES, LENS_TINTS } from './data/framesData.js';
import { VTOEngine } from './vto/VTOEngine.js';
import { FaceTracker } from './vto/FaceTracker.js';
import { analyzeFaceShape } from './vto/FaceShapeAnalyzer.js';

import { Navbar } from './components/Navbar.jsx';
import { VTOViewer } from './components/VTOViewer.jsx';
import { FrameCatalog } from './components/FrameCatalog.jsx';
import { CustomizerDrawer } from './components/CustomizerDrawer.jsx';
import { SnapshotModal } from './components/SnapshotModal.jsx';
import { FaceShapeModal } from './components/FaceShapeModal.jsx';
import { LegalNoticeModal } from './components/LegalNoticeModal.jsx';
import { CompareLooksModal } from './components/CompareLooksModal.jsx';
import { ValueProps } from './components/ValueProps.jsx';
import { FloatingDock } from './components/FloatingDock.jsx';

export default function App() {
  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const trackerRef = useRef(null);
  const faceAnalysisCounter = useRef(0);

  // Try-On Active State: Defaults to true for instant 60 FPS 3D studio experience on mobile/desktop with 0ms buffering
  const [isTryOnActive, setIsTryOnActive] = useState(true);
  const [tryonMode, setTryonMode] = useState('live');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoLandmarks, setPhotoLandmarks] = useState(null);

  // Eyewear Selection State
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [selectedColor, setSelectedColor] = useState(FRAMES[0].colors[0]);
  const [selectedLens, setSelectedLens] = useState(
    LENS_TINTS.find((l) => l.id === FRAMES[0].defaultLens) || LENS_TINTS[0]
  );

  // Micro-fit Calibration State
  const [microFit, setMicroFit] = useState({
    scale: 1.0,
    offsetY: 0.0,
    offsetZ: 0.0,
    tilt: 0.0
  });

  // Tracking & Engine States (Default to interactive 60 FPS 3D studio simulation)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(true);
  const [isTrackingFace, setIsTrackingFace] = useState(true);
  const [faceShapeData, setFaceShapeData] = useState(null);
  const [splitProgress, setSplitProgress] = useState(1.0);

  // Modals & Drawers
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [isFaceShapeModalOpen, setIsFaceShapeModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isCompareLooksOpen, setIsCompareLooksOpen] = useState(false);

  // Landmark handling from FaceTracker live feed
  const handleLandmarks = useCallback((landmarks, isFallback) => {
    if (!engineRef.current) return;

    // In photo mode with an active photo, we lock to photo landmarks
    if (tryonMode === 'photo' && photoLandmarks) {
      return;
    }

    if (landmarks) {
      setIsTrackingFace(true);
      engineRef.current.updateLandmarks(landmarks);

      faceAnalysisCounter.current += 1;
      if (faceAnalysisCounter.current % 20 === 0) {
        const analysis = analyzeFaceShape(landmarks);
        if (analysis) {
          setFaceShapeData(analysis);
        }
      }
    } else {
      setIsTrackingFace(false);
      engineRef.current.updateLandmarks(null);
    }
  }, [tryonMode, photoLandmarks]);

  // Initialize VTO Engine and Tracker on Mount
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const engine = new VTOEngine(canvasRef.current);
      engineRef.current = engine;
      engine.setGlasses(selectedFrame, selectedColor, selectedLens);

      const tracker = new FaceTracker({
        onLandmarks: handleLandmarks,
        onError: (err) => {
          console.warn('Camera initiation notice:', err);
          setIsFallbackMode(true);
        },
        onCameraReady: ({ width, height, isFallback }) => {
          setIsCameraActive(!isFallback);
          setIsFallbackMode(!!isFallback);
          if (engineRef.current) {
            engineRef.current.setVideoDimensions(width, height);
            if (canvasRef.current) {
              engineRef.current.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
            }
          }
        }
      });
      trackerRef.current = tracker;

      // Start 3D Studio Simulation immediately with zero network delay (60 FPS)
      tracker.startFallbackMode();
    } catch (engineErr) {
      console.warn('VTO engine initialization notice:', engineErr);
    }

    const handleResize = () => {
      if (engineRef.current && canvasRef.current) {
        engineRef.current.resize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
      }
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    let resizeRafId = null;
    if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && engineRef.current) {
            if (resizeRafId) cancelAnimationFrame(resizeRafId);
            resizeRafId = requestAnimationFrame(() => {
              if (engineRef.current) {
                engineRef.current.resize(width, height);
              }
            });
          }
        }
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (trackerRef.current) trackerRef.current.stop();
      if (engineRef.current) engineRef.current.destroy();
    };
  }, []);

  // Update Frame in 3D Scene
  const handleSelectFrame = (frame) => {
    setSelectedFrame(frame);
    const defaultCol = frame.colors[0];
    const defaultLn = LENS_TINTS.find((l) => l.id === frame.defaultLens) || LENS_TINTS[0];
    setSelectedColor(defaultCol);
    setSelectedLens(defaultLn);

    if (engineRef.current) {
      engineRef.current.setGlasses(frame, defaultCol, defaultLn);
      if (tryonMode === 'photo' && photoLandmarks) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  // Update Color finish
  const handleSelectColor = (color) => {
    setSelectedColor(color);
    if (engineRef.current) {
      engineRef.current.updateMaterials(color, selectedLens);
      if (tryonMode === 'photo' && photoLandmarks) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  // Update Lens treatment
  const handleSelectLens = (lens) => {
    setSelectedLens(lens);
    if (engineRef.current) {
      engineRef.current.updateMaterials(selectedColor, lens);
      if (tryonMode === 'photo' && photoLandmarks) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  // Update Micro-Fit
  const handleChangeMicroFit = (newFit) => {
    setMicroFit(newFit);
    if (engineRef.current) {
      engineRef.current.setMicroAdjustments(newFit);
      if (tryonMode === 'photo' && photoLandmarks) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  const handleResetMicroFit = () => {
    const defaultFit = { scale: 1.0, offsetY: 0.0, offsetZ: 0.0, tilt: 0.0 };
    setMicroFit(defaultFit);
    if (engineRef.current) {
      engineRef.current.setMicroAdjustments(defaultFit);
      if (tryonMode === 'photo' && photoLandmarks) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  // Split View change
  const handleSplitChange = (val) => {
    setSplitProgress(val);
    if (engineRef.current) {
      engineRef.current.setSplitProgress(val);
    }
  };

  // Activate front camera explicitly on user demand
  const handleActivateCamera = async () => {
    if (trackerRef.current && videoRef.current) {
      try {
        setIsFallbackMode(false);
        const success = await trackerRef.current.startCamera(videoRef.current);
        if (success) {
          setIsCameraActive(true);
          setTryonMode('live');
        } else {
          setIsFallbackMode(true);
        }
      } catch (err) {
        console.warn('Camera activation notice:', err);
        setIsFallbackMode(true);
      }
    }
  };

  // Switch back to 3D Studio Simulation (0ms delay, silky smooth 60 FPS)
  const handleSwitchToSimulation = () => {
    if (trackerRef.current) {
      trackerRef.current.startFallbackMode();
      setIsFallbackMode(true);
      setIsCameraActive(false);
      setCapturedPhoto(null);
      setPhotoLandmarks(null);
    }
  };

  // Toggle between Front Camera and 3D Studio Simulation
  const handleToggleCamera = () => {
    if (isCameraActive && !isFallbackMode) {
      handleSwitchToSimulation();
    } else {
      handleActivateCamera();
    }
  };

  // Start Try-On explicitly (called from CTA or Frame card click)
  const handleStartTryOn = async (frame = null) => {
    if (frame) {
      handleSelectFrame(frame);
    }
    setIsTryOnActive(true);
    if (!isCameraActive || isFallbackMode) {
      handleActivateCamera();
    }
  };

  // Stop Try-On explicitly (return to 3D studio simulation)
  const handleStopTryOn = () => {
    handleSwitchToSimulation();
  };

  // -------------------------------------------------------------
  // STUDIO PHOTO FITTING WORKFLOW
  // -------------------------------------------------------------
  const handleCapturePhoto = async () => {
    if (!videoRef.current || !trackerRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    // Grab high-resolution mirrored frame from webcam
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

    setCapturedPhoto(dataUrl);

    // Run high-precision landmark detection on the crisp static photo
    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      const landmarks = await trackerRef.current.processStaticImage(img, false);
      if (landmarks) {
        setPhotoLandmarks(landmarks);
        setIsTrackingFace(true);
        if (engineRef.current) {
          engineRef.current.setVideoDimensions(w, h);
          engineRef.current.updateLandmarks(landmarks);
        }
        const analysis = analyzeFaceShape(landmarks);
        if (analysis) setFaceShapeData(analysis);
      }
    };
  };

  const handleUploadPhoto = async (dataUrl) => {
    setIsTryOnActive(true);
    setCapturedPhoto(dataUrl);
    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      const w = img.naturalWidth || 1280;
      const h = img.naturalHeight || 720;
      const landmarks = await trackerRef.current.processStaticImage(img, false);
      if (landmarks) {
        setPhotoLandmarks(landmarks);
        setIsTrackingFace(true);
        if (engineRef.current) {
          engineRef.current.setVideoDimensions(w, h);
          engineRef.current.updateLandmarks(landmarks);
        }
        const analysis = analyzeFaceShape(landmarks);
        if (analysis) setFaceShapeData(analysis);
      }
    };
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoLandmarks(null);
    if (trackerRef.current && videoRef.current) {
      trackerRef.current.startCamera(videoRef.current);
    }
  };

  const handleSwitchMode = (newMode) => {
    setTryonMode(newMode);
    if (newMode === 'live') {
      if (trackerRef.current && videoRef.current) {
        trackerRef.current.startCamera(videoRef.current);
      }
    } else if (newMode === 'photo' && photoLandmarks) {
      if (engineRef.current) {
        engineRef.current.updateLandmarks(photoLandmarks);
      }
    }
  };

  // Save / Snapshot
  const handleCaptureSnapshot = () => {
    if (!engineRef.current) return;
    // In photo mode, create combined snapshot of the still photo + glasses
    if (tryonMode === 'photo' && capturedPhoto) {
      const img = new Image();
      img.src = capturedPhoto;
      img.onload = () => {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = engineRef.current.width;
        snapCanvas.height = engineRef.current.height;
        const ctx = snapCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, snapCanvas.width, snapCanvas.height);
        ctx.drawImage(canvasRef.current, 0, 0, snapCanvas.width, snapCanvas.height);

        // Watermark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, snapCanvas.height - 70, snapCanvas.width, 70);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.fillText('SPECTA AR LUXE', 30, snapCanvas.height - 35);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${selectedFrame.name} • ${selectedColor.name} • ₹${selectedFrame.price.toLocaleString('en-IN')}`, 30, snapCanvas.height - 16);

        const url = snapCanvas.toDataURL('image/jpeg', 0.95);
        setSnapshotUrl(url);
        setIsSnapshotOpen(true);
      };
    } else {
      const url = engineRef.current.captureSnapshot(videoRef.current);
      setSnapshotUrl(url);
      setIsSnapshotOpen(true);
    }
  };

  const handleOpenCompareLooks = () => {
    if (!capturedPhoto && videoRef.current && trackerRef.current && isCameraActive && !isFallbackMode) {
      handleCapturePhoto();
    }
    setIsCompareLooksOpen(true);
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#131313] text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30 relative overflow-x-hidden">
      {/* Subtle Living Atmospheric Glow Background (Stitch Design) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        isCameraActive={isCameraActive}
        isFallbackMode={isFallbackMode}
        onToggleCamera={handleToggleCamera}
        faceShapeData={faceShapeData}
        onOpenFaceShapeModal={() => setIsFaceShapeModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onOpenCompareLooks={handleOpenCompareLooks}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-20 pb-8 flex flex-col">
        {/* Virtual Try-On Stage Viewport */}
        <VTOViewer
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          isFallbackMode={isFallbackMode}
          isTrackingFace={isTrackingFace}
          currentFrame={selectedFrame}
          currentColor={selectedColor}
          currentLens={selectedLens}
          onCaptureSnapshot={handleCaptureSnapshot}
          onToggleCustomizer={() => setIsCustomizerOpen(true)}
          onResetFit={handleResetMicroFit}
          onOpenFaceShapeModal={() => setIsFaceShapeModalOpen(true)}
          onOpenCompareLooks={handleOpenCompareLooks}
          splitProgress={splitProgress}
          onSplitChange={handleSplitChange}
          // Try-On mode & activation
          isTryOnActive={isTryOnActive}
          onStartTryOn={handleStartTryOn}
          onStopTryOn={handleStopTryOn}
          // Photo fitting props
          mode={tryonMode}
          onSwitchMode={handleSwitchMode}
          capturedPhoto={capturedPhoto}
          onCapturePhoto={handleCapturePhoto}
          onRetakePhoto={handleRetakePhoto}
          onUploadPhoto={handleUploadPhoto}
          microFit={microFit}
          onChangeMicroFit={handleChangeMicroFit}
          // Frame swapper, color & lens props
          frames={FRAMES}
          onSelectFrame={handleSelectFrame}
          onSelectColor={handleSelectColor}
          lenses={LENS_TINTS}
          onSelectLens={handleSelectLens}
          onActivateCamera={handleActivateCamera}
          onSwitchToSimulation={handleSwitchToSimulation}
        />

        {/* Eyewear Collection Selector */}
        <FrameCatalog
          frames={FRAMES}
          selectedFrame={selectedFrame}
          onSelectFrame={handleSelectFrame}
          onStartTryOn={handleStartTryOn}
          isTryOnActive={isTryOnActive}
          faceShapeData={faceShapeData}
        />

        {/* AccuFit Optical Craftsmanship Bento Section (Stitch Luxury Design) */}
        <ValueProps />
      </main>

      {/* Lenskart Compare Looks Multi-Frame Modal */}
      <CompareLooksModal
        isOpen={isCompareLooksOpen}
        onClose={() => setIsCompareLooksOpen(false)}
        capturedPhoto={capturedPhoto}
        photoLandmarks={photoLandmarks}
        onSelectFrame={handleSelectFrame}
        currentFrame={selectedFrame}
        onCapturePhoto={handleCapturePhoto}
        onUploadPhoto={handleUploadPhoto}
      />

      {/* Slide-over Custom Atelier Drawer */}
      <CustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        selectedFrame={selectedFrame}
        selectedColor={selectedColor}
        onSelectColor={handleSelectColor}
        selectedLens={selectedLens}
        onSelectLens={handleSelectLens}
        microFit={microFit}
        onChangeMicroFit={handleChangeMicroFit}
        onResetMicroFit={handleResetMicroFit}
      />

      {/* High-Res Snapshot Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        snapshotUrl={snapshotUrl}
        frame={selectedFrame}
        color={selectedColor}
        lens={selectedLens}
      />

      {/* AI Face Shape Analysis Modal */}
      <FaceShapeModal
        isOpen={isFaceShapeModalOpen}
        onClose={() => setIsFaceShapeModalOpen(false)}
        faceShapeData={faceShapeData}
        frames={FRAMES}
        onSelectFrame={handleSelectFrame}
      />

      {/* Legal & Patent Freedom-to-Operate Modal */}
      <LegalNoticeModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Persistent Floating Glass Dock (Stitch Design) */}
      <FloatingDock
        selectedFrame={selectedFrame}
        isTryOnActive={isTryOnActive}
        onStartTryOn={handleStartTryOn}
        onOpenCompareLooks={handleOpenCompareLooks}
        onToggleCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Footer Branding & Legal Note */}
      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
        <p>© 2026 SpectaAR Studio. Built with Three.js & MediaPipe.</p>
        <button
          onClick={() => setIsLegalModalOpen(true)}
          className="text-amber-400 hover:text-amber-300 font-semibold transition-colors mt-2 sm:mt-0"
        >
          Commercial Freedom-to-Operate & Patent Clear
        </button>
      </footer>
    </div>
  );
}
