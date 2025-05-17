import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface FloatingParticlesProps {
  count?: number;
  radius?: number;
  size?: number;
  color?: string;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 100,
  radius = 5,
  size = 0.05,
  color = '#FF3366'
}) => {
  const { animationEnabled } = usePortfolio();
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const particleColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create random positions in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      // Add slight color variation
      const colorVariation = 0.1;
      colors[i3] = particleColor.r * (1 + Math.random() * colorVariation - colorVariation / 2);
      colors[i3 + 1] = particleColor.g * (1 + Math.random() * colorVariation - colorVariation / 2);
      colors[i3 + 2] = particleColor.b * (1 + Math.random() * colorVariation - colorVariation / 2);
    }
    
    return { positions, colors };
  }, [count, radius, color]);
  
  // Animation
  useFrame(({ clock }) => {
    if (!particlesRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Calculate unique oscillation for each particle
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Apply subtle motion
      positions[i3] = x + Math.sin(time * 0.2 + i * 0.1) * 0.01;
      positions[i3 + 1] = y + Math.cos(time * 0.2 + i * 0.05) * 0.01;
      positions[i3 + 2] = z + Math.sin(time * 0.2 + i * 0.02) * 0.01;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default FloatingParticles;
