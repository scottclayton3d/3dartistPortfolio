import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { useMousePosition } from '@/hooks/useMousePosition';

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
  const mouse = useMousePosition();
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
      
      // Get current position
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      
      // Apply basic motion
      const basicX = x + Math.sin(time * 0.2 + i * 0.1) * 0.01;
      const basicY = y + Math.cos(time * 0.2 + i * 0.05) * 0.01;
      const basicZ = z + Math.sin(time * 0.2 + i * 0.02) * 0.01;
      
      // Apply mouse influence if mouse position is available
      if (mouse) {
        // Get mouse position (normalized -1 to 1)
        const mouseX = mouse.relativeX || 0;
        const mouseY = mouse.relativeY || 0;
        
        // Calculate distance between particle and mouse pointer in world space
        const dx = x - mouseX * radius;
        const dy = y - mouseY * radius;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // Particles closer to mouse move more dramatically
        const mouseInfluence = Math.max(0, 1 - distanceToMouse / radius);
        const mouseAmplitude = 0.03 * mouseInfluence;
        
        // Safe division (avoid division by zero)
        const safeDistance = distanceToMouse === 0 ? 0.001 : distanceToMouse;
        
        // Add mouse-influenced motion
        positions[i3] = basicX + (dx / safeDistance) * mouseAmplitude;
        positions[i3 + 1] = basicY + (dy / safeDistance) * mouseAmplitude;
        positions[i3 + 2] = basicZ + Math.sin(time + i * 0.1) * mouseInfluence * 0.02;
      } else {
        // Fallback to basic motion if mouse position isn't available
        positions[i3] = basicX;
        positions[i3 + 1] = basicY;
        positions[i3 + 2] = basicZ;
      }
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
