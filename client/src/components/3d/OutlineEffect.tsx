import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Define the shader material
const OutlineMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0x00ffdd),
    opacity: 1.0,
    glowIntensity: 0.5,
    pulseSpeed: 0.5
  },
  '/shaders/outlineVertex.glsl',
  '/shaders/outlineFragment.glsl'
);

// Extend the materials to make them available in JSX
extend({ OutlineMaterial });

// Add the type definition for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      outlineMaterial: any;
    }
  }
}

interface OutlineEffectProps {
  modelUrl: string;
  color?: string;
  glowIntensity?: number;
  pulseSpeed?: number;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const OutlineEffect: React.FC<OutlineEffectProps> = ({
  modelUrl,
  color = '#00ffdd',
  glowIntensity = 0.5,
  pulseSpeed = 0.5,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}) => {
  const materialRef = useRef<any>();
  const { scene } = useGLTF(modelUrl);
  const model = scene.clone();
  
  // Update the shader time uniform on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.time += delta;
    }
  });
  
  // Convert hex color string to THREE.Color
  const threeColor = new THREE.Color(color);
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
      <mesh>
        <primitive object={model.clone()} />
        <outlineMaterial 
          ref={materialRef} 
          color={threeColor}
          glowIntensity={glowIntensity}
          pulseSpeed={pulseSpeed}
          transparent
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
};

export default OutlineEffect;