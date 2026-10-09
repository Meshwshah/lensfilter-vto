/**
 * Analyzes 3D facial landmarks from MediaPipe FaceMesh to classify face shape
 * and recommend optimal frame geometries.
 */

// Helper: 3D Euclidean distance
function distance3D(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function analyzeFaceShape(landmarks) {
  if (!landmarks || landmarks.length < 468) {
    return null;
  }

  // Key landmark indices from MediaPipe FaceMesh:
  // Top of forehead: 10
  // Chin bottom: 152
  // Left cheekbone / tragus: 234
  // Right cheekbone / tragus: 454
  // Left temple / forehead edge: 103
  // Right temple / forehead edge: 332
  // Left gonion (jaw corner): 172
  // Right gonion (jaw corner): 397

  const foreheadTop = landmarks[10];
  const chinBottom = landmarks[152];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const leftTemple = landmarks[103];
  const rightTemple = landmarks[332];
  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];

  const faceLength = distance3D(foreheadTop, chinBottom);
  const cheekWidth = distance3D(leftCheek, rightCheek);
  const foreheadWidth = distance3D(leftTemple, rightTemple);
  const jawWidth = distance3D(leftJaw, rightJaw);

  if (cheekWidth === 0) return null;

  const lengthToWidthRatio = faceLength / cheekWidth;
  const jawToCheekRatio = jawWidth / cheekWidth;
  const foreheadToCheekRatio = foreheadWidth / cheekWidth;

  let shape = 'Oval';
  let title = 'Harmonious Oval Face';
  let advice = 'Your balanced proportions look stunning with almost any style, especially bold Wayfarers and modern Aviators.';
  let bestFrames = ['Wayfarer', 'Aviator', 'Rimless'];

  if (lengthToWidthRatio < 1.28) {
    if (jawToCheekRatio > 0.82) {
      shape = 'Square';
      title = 'Structured Square Face';
      advice = 'Defined jawline and proportional width. Curved, round, or teardrop aviator frames soften strong angles beautifully.';
      bestFrames = ['Round', 'Aviator', 'Cat-Eye'];
    } else {
      shape = 'Round';
      title = 'Soft Round Face';
      advice = 'Curved contours with equal length and width. Bold geometric, rectangular, and cat-eye frames add structure and lengthen the face.';
      bestFrames = ['Wayfarer', 'Cat-Eye', 'Rimless'];
    }
  } else if (foreheadToCheekRatio > 0.88 && jawToCheekRatio < 0.72) {
    shape = 'Heart';
    title = 'Delicate Heart Face';
    advice = 'Broader brow with tapered chin. Lightweight round wireframes or bottom-heavy aviators balance the lower face effortlessly.';
    bestFrames = ['Aviator', 'Round', 'Rimless'];
  } else if (cheekWidth > foreheadWidth * 1.15 && cheekWidth > jawWidth * 1.2) {
    shape = 'Diamond';
    title = 'Dramatic Diamond Face';
    advice = 'High cheekbones with narrower forehead and jaw. Upswept Cat-Eye and delicate round rims highlight your cheek structure.';
    bestFrames = ['Cat-Eye', 'Round', 'Wayfarer'];
  } else {
    shape = 'Oval';
    title = 'Harmonious Oval Face';
    advice = 'Naturally balanced facial symmetry. Most silhouettes complement you, with square wayfarers and geometric aviators shining best.';
    bestFrames = ['Wayfarer', 'Aviator', 'Rimless'];
  }

  return {
    shape,
    title,
    advice,
    bestFrames,
    metrics: {
      lengthToWidth: lengthToWidthRatio.toFixed(2),
      jawToCheek: jawToCheekRatio.toFixed(2),
      foreheadToCheek: foreheadToCheekRatio.toFixed(2)
    }
  };
}
