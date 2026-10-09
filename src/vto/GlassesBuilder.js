import * as THREE from 'three';

/**
 * Photorealistic 3D Eyewear Architecture.
 * Anchored directly to the pupil gaze line for flawless anatomical fit.
 * Uses pixel-perfect aperture-masked optical lens textures with authentic
 * Anti-Reflective (AR) optical sheen, subtle feathered catchlights, and PBR env reflections.
 */

// Texture loader and cache
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();

export function getCachedTexture(url) {
  if (!url) return null;
  if (!textureCache.has(url)) {
    try {
      const tex = textureLoader.load(
        url,
        undefined,
        undefined,
        (err) => console.warn('Texture load fallback:', url, err)
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      textureCache.set(url, tex);
    } catch (e) {
      console.warn('Texture loader exception:', e);
      return null;
    }
  }
  return textureCache.get(url);
}

// Environment map helper - returns null to rely on pristine three-point studio lighting
export function createStudioEnvironmentMap(renderer) {
  return null;
}

// Contact Ambient Occlusion Shadow Texture (strictly under nose bridge, never over eyes)
let cachedShadowTex = null;
function getContactShadowTexture() {
  if (cachedShadowTex) return cachedShadowTex;
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 128);

    const bridgeGrad = ctx.createRadialGradient(128, 64, 2, 128, 64, 24);
    bridgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
    bridgeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.06)');
    bridgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = bridgeGrad;
    ctx.beginPath();
    ctx.ellipse(128, 64, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    cachedShadowTex = new THREE.CanvasTexture(canvas);
    cachedShadowTex.generateMipmaps = true;
    return cachedShadowTex;
  } catch (e) {
    console.warn('Contact shadow texture generation skipped:', e);
    return null;
  }
}

export function getLensTextureUrl(frameConfig, lensConfig) {
  const frameKey = frameConfig.lensKey || frameConfig.id.split('-')[0];
  const lensId = lensConfig?.id || 'clear';
  return `/images/lenses/${frameKey}_${lensId}.png`;
}

/**
 * Builds the complete photorealistic 3D eyewear model.
 * Origin (0,0,0) is calibrated to the user's pupil gaze line.
 */
export function buildGlassesModel(frameConfig, colorConfig, lensConfig, envMap) {
  const root = new THREE.Group();
  root.name = `glasses-${frameConfig.id}`;
  root.renderOrder = 10;

  const width = 1.0;
  const aspectRatio = frameConfig.aspectRatio || 2.5;
  const height = width / aspectRatio;
  
  // Optical pupil zone: height ratio down from the top of the frame where pupils must sit
  const opticalPupilYRatio = frameConfig.opticalPupilYRatio !== undefined ? frameConfig.opticalPupilYRatio : 0.38;

  // Center vertically so local Y = 0 is the exact pupil gaze line of the user!
  const verticalShift = -(0.5 - opticalPupilYRatio) * height;

  // 1. Curved Front Chassis Mesh
  // Plane is subdivided horizontally so it wraps gracefully around the face
  const frontGeo = new THREE.PlaneGeometry(width, height, 32, 6);
  frontGeo.translate(0, verticalShift, 0);

  // Apply 4-base anatomical wrap curvature across face
  const posAttr = frontGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    // Cylindrical wrap: temples pull back into depth
    const z = -(x * x) * 0.12;
    posAttr.setZ(i, z);
  }
  frontGeo.computeVertexNormals();

  // 2. Optical Lenses Mesh (Exact same geometry & wrap as chassis, sits right at Z = -0.002)
  const lensGeo = frontGeo.clone();
  const lensUrl = getLensTextureUrl(frameConfig, lensConfig);
  const lensTex = getCachedTexture(lensUrl);
  
  const lensMat = new THREE.MeshStandardMaterial({
    map: lensTex,
    transparent: true,
    opacity: 1.0,
    roughness: lensConfig?.roughness !== undefined ? lensConfig.roughness : 0.04,
    metalness: lensConfig?.metalness !== undefined ? lensConfig.metalness : 0.08,
    envMap: envMap,
    envMapIntensity: 0.65,
    side: THREE.FrontSide,
    depthWrite: false
  });

  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.name = 'optical-lenses';
  lensMesh.position.set(0, 0, -0.002);
  lensMesh.renderOrder = 12; // Sits right behind the chassis front rims
  root.add(lensMesh);

  // 3. Front Frame Chassis Mesh (Rims, bridge, and endpieces)
  const chassisTex = getCachedTexture(frameConfig.frontChassis || frameConfig.image);
  const chassisMat = new THREE.MeshStandardMaterial({
    map: chassisTex,
    transparent: true,
    alphaTest: 0.01,
    roughness: colorConfig?.roughness !== undefined ? colorConfig.roughness : 0.2,
    metalness: colorConfig?.metalness !== undefined ? colorConfig.metalness : 0.15,
    envMap: envMap,
    envMapIntensity: 0.40,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const frontMesh = new THREE.Mesh(frontGeo, chassisMat);
  frontMesh.name = 'front-chassis';
  frontMesh.position.set(0, 0, 0.0);
  frontMesh.renderOrder = 15;
  root.add(frontMesh);

  // 4. Subtle Contact Drop Shadow on Nasal Saddle
  const shadowTex = getContactShadowTexture();
  if (shadowTex) {
    const shadowGeo = new THREE.PlaneGeometry(width * 0.18, height * 0.20);
    shadowGeo.translate(0, verticalShift - 0.010 * height, -0.015);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.16,
      blending: THREE.MultiplyBlending,
      premultipliedAlpha: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.renderOrder = 5;
    root.add(shadowMesh);
  }

  // Material update hook for drawer customizer and live quick-swapping
  root.userData = {
    updateMaterials: (newColorConfig, newLensConfig, currentEnvMap) => {
      if (newColorConfig) {
        if (newColorConfig.metalness > 0.5) {
          chassisMat.metalness = newColorConfig.metalness;
        }
        if (newColorConfig.roughness !== undefined) {
          chassisMat.roughness = newColorConfig.roughness;
        }
        chassisMat.needsUpdate = true;
      }

      if (newLensConfig) {
        const targetEnv = currentEnvMap || envMap;
        const newLensUrl = getLensTextureUrl(frameConfig, newLensConfig);
        const newTex = getCachedTexture(newLensUrl);
        if (newTex) {
          lensMat.map = newTex;
          lensMat.roughness = newLensConfig.roughness !== undefined ? newLensConfig.roughness : 0.04;
          lensMat.metalness = newLensConfig.metalness !== undefined ? newLensConfig.metalness : 0.08;
          lensMat.envMap = targetEnv;
          lensMat.needsUpdate = true;
        }
      }
    }
  };

  return root;
}
