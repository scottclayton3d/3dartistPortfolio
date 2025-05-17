import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface ArtworkModelProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  textureUrl?: string;
  animate?: boolean;
}

const ArtworkModel: React.FC<ArtworkModelProps> = ({
  modelUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  textureUrl,
  animate = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { animationEnabled } = usePortfolio();
  
  // Load the model
  const { scene } = useGLTF(modelUrl);
  
  // Load texture if provided
  const texture = textureUrl ? useTexture(textureUrl) : null;
  
  // Apply texture to model if provided
  if (texture) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      }
    });
  }
  
  // Animation
  useFrame(({ clock }) => {
    if (!groupRef.current || !animate || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    
    // Apply gentle floating motion
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
    
    // Slow rotation
    groupRef.current.rotation.y = rotation[1] + time * 0.1;
  });
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    >
      <primitive object={scene.clone()} />
    </group>
  );
};

// Pre-load model to avoid loading delays
useGLTF.preload('/geometries/heart.gltf');

export default ArtworkModel;
