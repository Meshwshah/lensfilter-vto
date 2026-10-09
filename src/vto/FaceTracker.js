/**
 * FaceTracker handles webcam stream capture and MediaPipe FaceMesh
 * landmark detection with fallback demo mode.
 */

// Shared Singleton MediaPipe instance across React mounts & components
let sharedFaceMeshInstance = null;
let sharedFaceMeshPromise = null;
const activeResultListeners = new Set();

function setupFaceMeshResults(fm) {
  if (fm._hasResultsListener) return;
  fm._hasResultsListener = true;
  fm.onResults((results) => {
    activeResultListeners.forEach((listener) => {
      try {
        listener(results);
      } catch (err) {
        console.warn('FaceMesh listener error:', err);
      }
    });
  });
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve(true);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureMediaPipeLoaded() {
  if (window.FaceMesh) return true;

  // Try local first for zero-latency
  try {
    await loadScript('/mediapipe/face_mesh/face_mesh.js');
    if (window.FaceMesh) return true;
  } catch (err) {
    console.warn('Local FaceMesh script failed, falling back to CDN:', err);
  }

  // Fallback to high-speed global CDN for maximum reliability on mobile & iOS
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js');
    if (window.FaceMesh) return true;
  } catch (cdnErr) {
    console.warn('CDN FaceMesh script load failed:', cdnErr);
  }

  // Poll briefly in case still compiling
  for (let i = 0; i < 20; i++) {
    if (window.FaceMesh) return true;
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error('FaceMesh library could not be loaded');
}

async function getSharedFaceMesh() {
  if (sharedFaceMeshInstance) return sharedFaceMeshInstance;
  if (sharedFaceMeshPromise) return sharedFaceMeshPromise;

  sharedFaceMeshPromise = (async () => {
    await ensureMediaPipeLoaded();

    // Use local files with CDN fallback
    const locateFile = (file) => {
      // Direct local path
      return `/mediapipe/face_mesh/${file}`;
    };

    const fm = new window.FaceMesh({
      locateFile
    });

    fm.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    setupFaceMeshResults(fm);

    try {
      await fm.initialize();
    } catch (initErr) {
      console.warn('FaceMesh direct initialize note (non-fatal):', initErr);
    }

    sharedFaceMeshInstance = fm;
    return fm;
  })();

  return sharedFaceMeshPromise;
}

export class FaceTracker {
  constructor({ onLandmarks, onError, onCameraReady }) {
    this.onLandmarks = onLandmarks;
    this.onError = onError;
    this.onCameraReady = onCameraReady;
    
    this.videoElement = null;
    this.stream = null;
    this.faceMesh = null;
    this.camera = null;
    this.isTracking = false;
    this.isFallbackMode = false;
    this.fallbackAnimFrame = null;
    this.fallbackTime = 0;
    this.isProcessing = false;
    this.videoListener = null;
  }

  async startCamera(videoEl) {
    this.videoElement = videoEl;
    this.stop(); // Stop any existing session

    try {
      // 1. Request camera stream with mobile-first front-camera constraints
      let stream = null;
      try {
        const mobileConstraints = {
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(mobileConstraints);
      } catch (cErr) {
        try {
          console.warn('Advanced camera constraints rejected, trying basic front camera:', cErr);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: 'user' }
          });
        } catch (cErr2) {
          console.warn('Front camera rejected, attempting basic video stream:', cErr2);
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      this.stream = stream;
      this.videoElement.srcObject = stream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('webkit-playsinline', 'true');
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.autoplay = true;

      // Track true video stream dimensions dynamically (crucial for mobile portrait orientation)
      const notifyDimensions = () => {
        if (this.videoElement && this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0) {
          const vw = this.videoElement.videoWidth;
          const vh = this.videoElement.videoHeight;
          if (vw !== this.lastReportedWidth || vh !== this.lastReportedHeight) {
            this.lastReportedWidth = vw;
            this.lastReportedHeight = vh;
            if (this.onCameraReady) {
              this.onCameraReady({ width: vw, height: vh, isFallback: false });
            }
          }
        }
      };

      this.videoElement.onloadedmetadata = notifyDimensions;
      this.videoElement.onplaying = notifyDimensions;
      this.videoElement.onresize = notifyDimensions;

      // Ensure video element begins playback
      try {
        await this.videoElement.play();
      } catch (playErr) {
        console.warn('Video play triggered:', playErr);
      }

      // 2. Initialize / obtain FaceMesh instance
      this.faceMesh = await getSharedFaceMesh();

      this.videoListener = (results) => {
        if (!this.isTracking || this.isFallbackMode) return;
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const raw = results.multiFaceLandmarks[0];
          // Mirror landmarks horizontally (1 - x) to match CSS mirrored video feed
          const mirrored = raw.map((p) => ({
            x: 1.0 - p.x,
            y: p.y,
            z: p.z || 0
          }));
          this.onLandmarks(mirrored, false);
        } else {
          this.onLandmarks(null, false);
        }
      };

      activeResultListeners.add(this.videoListener);

      this.isTracking = true;
      this.isFallbackMode = false;
      this.isProcessing = false;

      // Start processing loop with mobile performance throttle (max 33 FPS inference to prevent overheating)
      let lastProcessTime = 0;
      const TARGET_INTERVAL_MS = 28;

      const processFrame = async () => {
        if (!this.isTracking || this.isFallbackMode) return;
        
        notifyDimensions();
        const now = performance.now();

        if (
          !this.isProcessing &&
          this.videoElement &&
          this.videoElement.readyState >= 2 &&
          now - lastProcessTime >= TARGET_INTERVAL_MS
        ) {
          this.isProcessing = true;
          lastProcessTime = now;
          try {
            await this.faceMesh.send({ image: this.videoElement });
          } catch (e) {
            // Drop frame if busy or context lost
          } finally {
            this.isProcessing = false;
          }
        }
        if (this.isTracking) {
          requestAnimationFrame(processFrame);
        }
      };

      requestAnimationFrame(processFrame);
      notifyDimensions();

      return true;
    } catch (err) {
      console.warn('Camera access failed, falling back to interactive demo model mode:', err);
      if (this.onError) {
        this.onError(err);
      }
      this.startFallbackMode();
      return false;
    }
  }

  // Process a static high-res photo or uploaded image
  async processStaticImage(imageElement, shouldMirror = false) {
    try {
      const fm = await getSharedFaceMesh();

      return new Promise((resolve) => {
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            activeResultListeners.delete(staticListener);
            resolve(null);
          }
        }, 5000);

        const staticListener = (results) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          activeResultListeners.delete(staticListener);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const raw = results.multiFaceLandmarks[0];
            const processed = raw.map((p) => ({
              x: shouldMirror ? 1.0 - p.x : p.x,
              y: p.y,
              z: p.z || 0
            }));
            resolve(processed);
          } else {
            resolve(null);
          }
        };

        activeResultListeners.add(staticListener);
        fm.send({ image: imageElement }).catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            activeResultListeners.delete(staticListener);
            resolve(null);
          }
        });
      });
    } catch (err) {
      console.warn('Static image processing notice:', err);
      return null;
    }
  }

  // Interactive fallback simulation mode
  startFallbackMode() {
    this.stopStream();
    this.isTracking = true;
    this.isFallbackMode = true;

    const animateFallback = () => {
      if (!this.isTracking || !this.isFallbackMode) return;
      this.fallbackTime += 0.025;

      // Simulated gentle natural head motion
      const headSwayX = Math.sin(this.fallbackTime * 0.8) * 0.04;
      const headSwayY = Math.cos(this.fallbackTime * 0.6) * 0.02;
      const headTurnYaw = Math.sin(this.fallbackTime * 0.8) * 0.03;

      // Center in screen
      const cx = 0.5 + headSwayX;
      const cy = 0.44 + headSwayY;
      const eyeSpan = 0.12;

      const simulatedLandmarks = new Array(478).fill(null).map((_, i) => ({
        x: cx,
        y: cy,
        z: 0
      }));

      // Key landmark positions (mirrored screen coordinates):
      // 6: Nasal saddle / Bridge Anchor
      simulatedLandmarks[6] = { x: cx, y: cy - 0.02, z: 0 };
      // 168: Nose bridge top
      simulatedLandmarks[168] = { x: cx, y: cy - 0.02, z: 0 };
      // 1: Nose tip
      simulatedLandmarks[1] = { x: cx + headTurnYaw * 0.8, y: cy + 0.05, z: 0.04 };
      // 10: Forehead top
      simulatedLandmarks[10] = { x: cx, y: cy - 0.22, z: -0.05 };
      // 152: Chin
      simulatedLandmarks[152] = { x: cx, y: cy + 0.26, z: 0.02 };
      // In mirrored coordinates:
      // 473: Left pupil (appears on LEFT of mirrored screen: cx - eyeSpan * 0.6)
      simulatedLandmarks[473] = { x: cx - eyeSpan * 0.6, y: cy - 0.02, z: headTurnYaw * 0.03 };
      // 468: Right pupil (appears on RIGHT of mirrored screen: cx + eyeSpan * 0.6)
      simulatedLandmarks[468] = { x: cx + eyeSpan * 0.6, y: cy - 0.02, z: -headTurnYaw * 0.03 };
      // 263: Left eye outer corner (appears on LEFT of mirrored screen: cx - eyeSpan)
      simulatedLandmarks[263] = { x: cx - eyeSpan, y: cy - 0.02, z: headTurnYaw * 0.05 };
      // 33: Right eye outer corner (appears on RIGHT of mirrored screen: cx + eyeSpan)
      simulatedLandmarks[33] = { x: cx + eyeSpan, y: cy - 0.02, z: -headTurnYaw * 0.05 };
      // Cheeks & temples
      simulatedLandmarks[234] = { x: cx + eyeSpan * 1.5, y: cy + 0.02, z: -0.15 };
      simulatedLandmarks[454] = { x: cx - eyeSpan * 1.5, y: cy + 0.02, z: -0.15 };
      simulatedLandmarks[103] = { x: cx + eyeSpan * 1.2, y: cy - 0.15, z: -0.08 };
      simulatedLandmarks[332] = { x: cx - eyeSpan * 1.2, y: cy - 0.15, z: -0.08 };
      simulatedLandmarks[172] = { x: cx + eyeSpan * 0.9, y: cy + 0.18, z: 0 };
      simulatedLandmarks[397] = { x: cx - eyeSpan * 0.9, y: cy + 0.18, z: 0 };

      this.onLandmarks(simulatedLandmarks, true);
      this.fallbackAnimFrame = requestAnimationFrame(animateFallback);
    };

    this.fallbackAnimFrame = requestAnimationFrame(animateFallback);

    if (this.onCameraReady) {
      this.onCameraReady({ width: 1280, height: 720, isFallback: true });
    }
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  stop() {
    this.isTracking = false;
    this.isProcessing = false;
    if (this.videoListener) {
      activeResultListeners.delete(this.videoListener);
      this.videoListener = null;
    }
    this.stopStream();
    if (this.fallbackAnimFrame) {
      cancelAnimationFrame(this.fallbackAnimFrame);
      this.fallbackAnimFrame = null;
    }
  }
}
