import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';

const MatrixRain = () => {
  const { animationEnabled } = usePortfolio();
  const meshRef = useRef<THREE.Points>(null);
  const particleCount = 5000;

  // Create particles
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    // Spread particles in a column formation
    positions[i * 3] = (Math.random() - 0.5) * 30;     // x
    positions[i * 3 + 1] = Math.random() * 50 - 25;    // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z

    // Bright green color with slight variation
    colors[i * 3] = 0;
    colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
    colors[i * 3 + 2] = 0;

    // Varied sizes for depth effect
    sizes[i] = Math.random() * 0.5 + 0.1;
  }

  useFrame((_, delta) => {
    if (!meshRef.current || !animationEnabled) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const fallSpeed = 15; // Increased fall speed

    for (let i = 0; i < positions.length; i += 3) {
      // Update y position (falling effect)
      positions[i + 1] -= (Math.random() * 0.5 + 0.5) * fallSpeed * delta;

      // Reset when particle reaches bottom
      if (positions[i + 1] < -25) {
        positions[i + 1] = 25;
        positions[i] = (Math.random() - 0.5) * 30;     // Randomize x
        positions[i + 2] = (Math.random() - 0.5) * 30; // Randomize z
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default MatrixRain;