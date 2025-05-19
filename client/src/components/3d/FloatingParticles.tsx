
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';

const MatrixEffect = () => {
  const { animationEnabled } = usePortfolio();
  const meshRef = useRef<THREE.Points>(null);
  
  // Constants from matrix.js
  const charW = 6;
  const charH = 10;
  const bufferCW = 80;
  const bufferCH = 24;
  const characterSet = Array.from({ length: 100 }, (_, i) => 
    String.fromCharCode(0x30A0 + Math.random() * 96)
  );

  // Create particles
  const particleCount = bufferCW * bufferCH;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const col = i % bufferCW;
    const row = Math.floor(i / bufferCW);

    // Grid formation with slight randomization
    positions[i * 3] = (col - bufferCW / 2) * charW * 0.1;
    positions[i * 3 + 1] = (bufferCH / 2 - row) * charH * 0.1;
    positions[i * 3 + 2] = 0;

    // Matrix green with varying brightness
    const brightness = 0.3 + Math.random() * 0.7;
    colors[i * 3] = 0;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = 0;

    // Varying sizes and speeds
    sizes[i] = Math.random() * 2 + 1;
    speeds[i] = Math.random() * 15 + 5;
  }

  useFrame((_, delta) => {
    if (!meshRef.current || !animationEnabled) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const colors = meshRef.current.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Update y position (falling effect)
      positions[i * 3 + 1] -= speeds[i] * delta;

      // Reset when particle reaches bottom
      if (positions[i * 3 + 1] < -(bufferCH / 2) * charH * 0.1) {
        positions[i * 3 + 1] = (bufferCH / 2) * charH * 0.1;
        
        // Randomize brightness on reset
        const brightness = 0.3 + Math.random() * 0.7;
        colors[i * 3 + 1] = brightness;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
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
        size={1.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default MatrixEffect;
