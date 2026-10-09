import * as THREE from 'three';

/**
 * High-precision mathematical transformation for MediaPipe FaceMesh to Three.js.
 * Anchors the glasses directly at the pupil center line and nasal saddle
 * so the bridge rests firmly on the nose and the lenses cover the eyes naturally.
 */

export class Smoother {
  constructor(posFactor = 0.55, rotFactor = 0.45, scaleFactor = 0.45) {
    this.posFactor = posFactor;
    this.rotFactor = rotFactor;
    this.scaleFactor = scaleFactor;
    this.pos = new THREE.Vector3();
    this.rot = new THREE.Euler(0, 0, 0, 'YXZ');
    this.scale = 1.0;
    this.initialized = false;
  }

  update(targetPos, targetRot, targetScale) {
    if (!this.initialized) {
      this.pos.copy(targetPos);
      this.rot.copy(targetRot);
      this.scale = targetScale;
      this.initialized = true;
      return { pos: this.pos, rot: this.rot, scale: this.scale };
    }

    // Exponential smoothing
    this.pos.lerp(targetPos, this.posFactor);
    
    // Smooth rotation angles
    this.rot.x += (targetRot.x - this.rot.x) * this.rotFactor;
    this.rot.y += (targetRot.y - this.rot.y) * this.rotFactor;
    this.rot.z += (targetRot.z - this.rot.z) * this.rotFactor;

    // Smooth scale
    this.scale += (targetScale - this.scale) * this.scaleFactor;

    return { pos: this.pos, rot: this.rot, scale: this.scale };
  }

  reset() {
    this.initialized = false;
  }
}

/**
 * Calculates 3D pose, position, and scale for glasses from MediaPipe face landmarks.
 * Landmarks are assumed to be mirrored in X (to match mirrored video).
 */
export function calculateFacePose(landmarks, canvasWidth, canvasHeight, videoDimensions = null, frameConfig = null) {
  if (!landmarks || landmarks.length < 468) return null;

  // Object-cover CSS compensation
  let mapX = (x) => x;
  let mapY = (y) => y;

  if (videoDimensions && videoDimensions.videoWidth > 0 && videoDimensions.videoHeight > 0) {
    const { videoWidth, videoHeight } = videoDimensions;
    const coverScale = Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight);
    const renderedW = videoWidth * coverScale;
    const renderedH = videoHeight * coverScale;
    const offX = (canvasWidth - renderedW) / 2;
    const offY = (canvasHeight - renderedH) / 2;

    mapX = (normX) => (offX + normX * renderedW) / canvasWidth;
    mapY = (normY) => (offY + normY * renderedH) / canvasHeight;
  }

  // Key MediaPipe landmarks:
  // 6: Nasal saddle / root of nose (between the eyes)
  // 195: Nasal crest bone (exact rest point for eyewear bridge and nose pads)
  // 168: Glabella / bridge top
  // 1: Nose tip
  // 33, 133: Right eye corners
  // 263, 362: Left eye corners
  // 468, 473: Left & Right pupils (iris landmarks)

  const ptSaddle = landmarks[6] || landmarks[168];
  const ptBridge195 = landmarks[195] || ptSaddle;
  const ptTip = landmarks[1];

  let screenLeftEye, screenRightEye;

  if (landmarks[468] && landmarks[473]) {
    // Landmark 468 is Right Eye, 473 is Left Eye
    // Sort strictly by X coordinate so screenLeftEye is ALWAYS screen-left and screenRightEye is screen-right
    const pA = { x: mapX(landmarks[468].x) * canvasWidth, y: mapY(landmarks[468].y) * canvasHeight };
    const pB = { x: mapX(landmarks[473].x) * canvasWidth, y: mapY(landmarks[473].y) * canvasHeight };
    screenLeftEye = pA.x < pB.x ? pA : pB;
    screenRightEye = pA.x < pB.x ? pB : pA;
  } else {
    // Fallback using outer eye corners (33 and 263)
    const pA = { x: mapX(landmarks[33].x) * canvasWidth, y: mapY(landmarks[33].y) * canvasHeight };
    const pB = { x: mapX(landmarks[263].x) * canvasWidth, y: mapY(landmarks[263].y) * canvasHeight };
    screenLeftEye = pA.x < pB.x ? pA : pB;
    screenRightEye = pA.x < pB.x ? pB : pA;
  }

  // Inter-Pupillary Distance (IPD) in screen pixels
  const eyeDistPixels = Math.hypot(screenRightEye.x - screenLeftEye.x, screenRightEye.y - screenLeftEye.y);
  if (eyeDistPixels < 8) return null;

  // Nasal Saddle & Nasal Bone Pixel Coordinates
  const saddleX = mapX(ptSaddle.x) * canvasWidth;
  const saddleY = mapY(ptSaddle.y) * canvasHeight;
  const bridgeX = mapX(ptBridge195.x) * canvasWidth;
  const bridgeY = mapY(ptBridge195.y) * canvasHeight;

  const tipX = mapX(ptTip.x) * canvasWidth;
  const tipY = mapY(ptTip.y) * canvasHeight;

  // Horizontal and vertical midpoint between pupils
  const pupilMidX = (screenLeftEye.x + screenRightEye.x) / 2;
  const pupilMidY = (screenLeftEye.y + screenRightEye.y) / 2;

  // Primary Optical Eye Anchor:
  // Horizontally centered on the midpoint between pupils (blended with nasal saddle for facial symmetry)
  const anchorX = pupilMidX * 0.70 + saddleX * 0.30;
  // Vertically locked directly to the interpupillary gaze line!
  // This guarantees that the user's pupils are placed directly inside the upper optical zone of the lenses,
  // and the top browline sits gracefully beneath the eyebrow arch without sagging down the nose.
  const anchorY = pupilMidY;

  // 1. 3D World Position:
  // (anchorX, anchorY) is mapped directly into Three.js 1:1 pixel coordinates
  const worldX = anchorX - canvasWidth / 2;
  const worldY = -(anchorY - canvasHeight / 2);
  const worldZ = 0;
  const position = new THREE.Vector3(worldX, worldY, worldZ);

  // 2. Head Rotation (Euler YXZ):
  // Roll: Angle of the eye line across the screen
  // dX is GUARANTEED positive because screenLeftEye.x < screenRightEye.x!
  const dX = screenRightEye.x - screenLeftEye.x;
  const dY = screenRightEye.y - screenLeftEye.y;
  const screenRoll = Math.atan2(dY, dX);
  const roll = -screenRoll;

  // Yaw: Left/Right head turn
  const yawOffset = tipX - saddleX;
  const yaw = THREE.MathUtils.clamp((yawOffset / eyeDistPixels) * 1.8, -0.85, 0.85);

  // Pitch: Up/Down head nod
  const tipDownY = tipY - saddleY;
  const pitchRatio = tipDownY / eyeDistPixels;
  // Natural baseline looking straight
  const pitch = THREE.MathUtils.clamp(-(pitchRatio - 0.38) * 1.8, -0.45, 0.45);

  const rotation = new THREE.Euler(pitch, yaw, roll, 'YXZ');

  // 3. Proportional Scaling with 3D Foreshortening Compensation:
  // Compensate for 2D foreshortening so that Three.js 3D perspective rotation
  // handles head yaw without shrinking or expanding the glasses unnaturally.
  const cosYaw = Math.max(0.68, Math.cos(yaw));
  const unforeshortenedEyeDist = eyeDistPixels / cosYaw;

  let faceWidthPixels = unforeshortenedEyeDist * 2.12;
  if (landmarks[234] && landmarks[454]) {
    const tA = { x: mapX(landmarks[234].x) * canvasWidth, y: mapY(landmarks[234].y) * canvasHeight };
    const tB = { x: mapX(landmarks[454].x) * canvasWidth, y: mapY(landmarks[454].y) * canvasHeight };
    const distT = Math.hypot(tB.x - tA.x, tB.y - tA.y) / cosYaw;
    if (distT > unforeshortenedEyeDist * 1.4 && distT < unforeshortenedEyeDist * 2.8) {
      faceWidthPixels = distT;
    }
  }

  // Mathematically lock frame width to pupil span ratio
  const ipdScale = unforeshortenedEyeDist / (frameConfig?.spanRatio || 0.485);
  const scale = ipdScale * 0.65 + (faceWidthPixels * 0.98) * 0.35;

  return {
    position,
    rotation,
    scale,
    eyeDistPixels,
    pupilMidX,
    pupilMidY,
    anchorPixel: { x: anchorX, y: anchorY },
    screenRoll
  };
}
