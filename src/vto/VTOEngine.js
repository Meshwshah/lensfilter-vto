import * as THREE from 'three';
import { buildGlassesModel, createStudioEnvironmentMap } from './GlassesBuilder.js';
import { createHeadOccluder } from './OccluderFace.js';
import { calculateFacePose, Smoother } from './FaceMath.js';

/**
 * High-performance 3D Virtual Try-On Engine.
 * 1:1 pixel coordinate matching with Three.js PerspectiveCamera.
 */
export class VTOEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = canvasElement.clientWidth || 1280;
    this.height = canvasElement.clientHeight || 720;

    // 1. WebGL Renderer with iOS & battery-saver fallback
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'default'
      });
    } catch (e) {
      console.warn('Standard WebGL creation failed, attempting low-power fallback:', e);
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: false,
          powerPreference: 'low-power'
        });
      } catch (e2) {
        console.error('WebGL is unavailable on this device/browser:', e2);
        this.renderer = null;
      }
    }

    if (this.renderer) {
      this.renderer.setSize(this.width, this.height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      // Handle context loss gracefully (common on iOS when switching apps)
      this.canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost, pausing render loop');
        this.isRendering = false;
      }, false);

      this.canvas.addEventListener('webglcontextrestored', () => {
        console.info('WebGL context restored, resuming render loop');
        this.isRendering = true;
        requestAnimationFrame(this.renderLoop);
      }, false);
    }

    // 2. Camera: 1:1 pixel space mapping at Z = 0
    this.scene = new THREE.Scene();
    this.cameraDistance = 1000;
    const fov = 2 * Math.atan((this.height / 2) / this.cameraDistance) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 1, 5000);
    this.camera.position.set(0, 0, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);

    // Studio Environment & Lighting
    this.envMap = this.renderer ? createStudioEnvironmentMap(this.renderer) : null;
    if (this.envMap) {
      this.scene.environment = this.envMap;
    }

    // Balanced lighting to preserve authentic photographic chassis textures without washing out
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 0.45);
    keyLight.position.set(150, 250, 400);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.25);
    fillLight.position.set(-200, 100, 300);
    this.scene.add(fillLight);

    // 3. Anchor Root (Face Anchor Group)
    this.faceAnchor = new THREE.Group();
    this.faceAnchor.visible = false;
    this.scene.add(this.faceAnchor);

    // 4. Occluder Mesh (Hides glasses arms behind ears)
    this.occluder = createHeadOccluder();
    this.faceAnchor.add(this.occluder);

    // 5. Glasses Container
    this.glassesGroup = new THREE.Group();
    this.faceAnchor.add(this.glassesGroup);

    // 6. State
    this.currentGlasses = null;
    this.currentFrameConfig = null;
    this.currentColorConfig = null;
    this.currentLensConfig = null;
    this.videoDimensions = null;

    // Micro-fit adjustments
    this.scaleMultiplier = 1.0;
    this.offsetY = 0.0;
    this.offsetZ = 0.0;
    this.tiltOffset = 0.0;

    // Split before/after slider (0 to 1, default 1 = full tryon)
    this.splitProgress = 1.0;

    // Smoothing filter
    this.smoother = new Smoother(0.45, 0.35, 0.35);
    this.hasActiveFace = false;

    // Start render loop only if renderer is active
    this.animationFrameId = null;
    this.isRendering = !!this.renderer;
    this.renderLoop = this.renderLoop.bind(this);
    if (this.renderer) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  resize(width, height) {
    if (!width || !height || width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;

    try {
      // Recompute FOV so 1 unit = 1 pixel at Z = 0
      this.camera.fov = 2 * Math.atan((height / 2) / this.cameraDistance) * (180 / Math.PI);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      if (this.renderer) {
        this.renderer.setSize(width, height, false);
      }
    } catch (err) {
      console.warn('VTOEngine resize notice:', err);
    }
  }

  setVideoDimensions(width, height) {
    this.videoDimensions = { videoWidth: width, videoHeight: height };
  }

  // Load / Swap Glasses Frame
  setGlasses(frameConfig, colorConfig, lensConfig) {
    this.currentFrameConfig = frameConfig;
    this.currentColorConfig = colorConfig;
    this.currentLensConfig = lensConfig;

    while (this.glassesGroup.children.length > 0) {
      const child = this.glassesGroup.children[0];
      this.glassesGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    this.currentGlasses = buildGlassesModel(
      frameConfig,
      colorConfig,
      lensConfig,
      this.envMap
    );

    this.glassesGroup.add(this.currentGlasses);
  }

  // Live update materials without rebuilding geometry
  updateMaterials(colorConfig, lensConfig) {
    this.currentColorConfig = colorConfig;
    this.currentLensConfig = lensConfig;

    if (this.currentGlasses && this.currentGlasses.userData.updateMaterials) {
      this.currentGlasses.userData.updateMaterials(colorConfig, lensConfig, this.envMap);
    }
  }

  // Set Micro-fit adjustments
  setMicroAdjustments({ scale = 1.0, offsetY = 0.0, offsetZ = 0.0, tilt = 0.0 }) {
    this.scaleMultiplier = scale;
    this.offsetY = offsetY;
    this.offsetZ = offsetZ;
    this.tiltOffset = tilt;
  }

  // Set Split View progress (0.0 to 1.0)
  setSplitProgress(val) {
    this.splitProgress = Math.max(0.0, Math.min(1.0, val));
  }

  // Process landmarks from FaceTracker
  updateLandmarks(landmarks) {
    if (!landmarks) {
      this.hasActiveFace = false;
      this.faceAnchor.visible = false;
      return;
    }

    const pose = calculateFacePose(
      landmarks,
      this.width,
      this.height,
      this.videoDimensions,
      this.currentFrameConfig
    );

    if (!pose) {
      this.hasActiveFace = false;
      this.faceAnchor.visible = false;
      return;
    }

    this.hasActiveFace = true;
    this.faceAnchor.visible = true;

    // Apply micro adjustments
    const adjustedScale = pose.scale * this.scaleMultiplier;
    const adjustedRot = pose.rotation.clone();
    adjustedRot.x += this.tiltOffset;

    // Smooth position, rotation, and scale to prevent jitter
    const smoothed = this.smoother.update(pose.position, adjustedRot, adjustedScale);

    this.faceAnchor.position.copy(smoothed.pos);
    // Vertical nose height offset (scaled to face size)
    this.faceAnchor.position.y += this.offsetY * smoothed.scale;
    this.faceAnchor.position.z += this.offsetZ * smoothed.scale;

    this.faceAnchor.rotation.copy(smoothed.rot);
    this.faceAnchor.scale.setScalar(smoothed.scale);
  }

  renderLoop() {
    if (!this.isRendering || !this.renderer) return;

    try {
      if (this.splitProgress >= 0.99) {
        this.renderer.setScissorTest(false);
        this.renderer.render(this.scene, this.camera);
      } else if (this.splitProgress <= 0.01) {
        this.renderer.clear();
      } else {
        // Split view: render try-on only on the active side
        this.renderer.setScissorTest(true);
        this.renderer.setScissor(0, 0, this.width * this.splitProgress, this.height);
        this.renderer.setViewport(0, 0, this.width, this.height);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setScissorTest(false);
      }
    } catch (e) {
      console.warn('VTOEngine render loop frame notice:', e);
    }

    if (this.isRendering && this.renderer) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  captureSnapshot(videoElement) {
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = this.width;
    snapCanvas.height = this.height;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return null;

    // Draw mirrored video
    ctx.save();
    ctx.translate(this.width, 0);
    ctx.scale(-1, 1);
    if (videoElement && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0, this.width, this.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();

    // Draw un-mirrored 3D canvas (since canvas matches mirrored video coordinate space directly)
    if (this.canvas) {
      ctx.drawImage(this.canvas, 0, 0, this.width, this.height);
    }

    // Luxury watermark & frame info
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, this.height - 70, this.width, 70);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px "Cinzel", serif';
    ctx.fillText('SPECTA AR LUXE', 30, this.height - 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    const modelText = this.currentFrameConfig
      ? `${this.currentFrameConfig.name} • ${this.currentColorConfig?.name || ''}`
      : 'Virtual Eyewear Try-On';
    ctx.fillText(modelText, 30, this.height - 16);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Real-Time 3D Fitting Technology', this.width - 30, this.height - 25);
    ctx.restore();

    return snapCanvas.toDataURL('image/jpeg', 0.95);
  }

  destroy() {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.renderer) {
      try {
        this.renderer.dispose();
      } catch (e) {
        console.warn('VTOEngine dispose note:', e);
      }
      this.renderer = null;
    }
  }
}
