import * as THREE from 'three';

/**
 * Creates an invisible 3D occluder mesh (back of head & ears).
 * Positioned strictly behind the face (Z <= -0.4) so it NEVER clips
 * the nose bridge or front frames, but cleanly hides the ear stems
 * when the user turns their head sideways.
 */
export function createHeadOccluder() {
  const group = new THREE.Group();
  group.name = 'head-occluder';

  // Depth-only invisible material
  const occluderMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    colorWrite: false,
    depthWrite: true,
    side: THREE.DoubleSide
  });

  // Back of head sphere (situated far back at Z = -0.8)
  const headGeo = new THREE.SphereGeometry(0.70, 20, 20);
  headGeo.scale(1.0, 1.2, 1.0);
  const headMesh = new THREE.Mesh(headGeo, occluderMat);
  headMesh.position.set(0, -0.05, -0.85);
  group.add(headMesh);

  // Left ear cylinder (situated at Z = -0.55)
  const leftEarGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.7, 12);
  const leftEar = new THREE.Mesh(leftEarGeo, occluderMat);
  leftEar.position.set(-0.62, -0.10, -0.65);
  leftEar.rotation.z = 0.1;
  group.add(leftEar);

  // Right ear cylinder (situated at Z = -0.55)
  const rightEarGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.7, 12);
  const rightEar = new THREE.Mesh(rightEarGeo, occluderMat);
  rightEar.position.set(0.62, -0.10, -0.65);
  rightEar.rotation.z = -0.1;
  group.add(rightEar);

  group.renderOrder = 0;
  return group;
}
