import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface ParticleTrailsProps {
  count?: number;
  trailLength?: number;
  size?: number;
  color?: string;
  fadeSpeed?: number;
  followSpeed?: number;
}

const ParticleTrails: React.FC<ParticleTrailsProps> = ({
  count = 12,
  trailLength = 8,
  size = 0.002,
  color = '#ff2d92',
  fadeSpeed = 0.04,
  followSpeed = 0.1,
}) => {
  const { animationEnabled } = usePortfolio();
  const mouse = useMousePosition();
  const particlesRef = useRef<THREE.Points>(null);
  
  // Convert mouse coordinates to 3D space
  const getMousePosition = () => {
    const x = (mouse.relativeX || 0) * 3; // Scale to larger values for better visibility
    const y = (mouse.relativeY || 0) * 2;
    return [x, y, 0];
  };
  
  // Initialize particle trails
  const particles = useMemo(() => {
    // Create arrays for positions and colors
    const positions = new Float32Array(count * trailLength * 3);
    const colors = new Float32Array(count * trailLength * 3);
    const sizes = new Float32Array(count * trailLength);
    const opacities = new Float32Array(count * trailLength);
    
    // Create particle color from prop
    const particleColor = new THREE.Color(color);
    
    // Initialize particle trail positions in a ring around center
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1 + Math.random() * 2;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      
      for (let j = 0; j < trailLength; j++) {
        const index = i * trailLength + j;
        const i3 = index * 3;
        
        // Particles start in ring formation
        positions[i3] = offsetX;
        positions[i3 + 1] = offsetY;
        positions[i3 + 2] = 0;
        
        // Colors with gradient effect along trail
        const trailFactor = 1 - j / trailLength;
        colors[i3] = particleColor.r;
        colors[i3 + 1] = particleColor.g;
        colors[i3 + 2] = particleColor.b;
        
        // Size decreases along trail
        sizes[index] = size * (1 - 0.5 * (j / trailLength));
        
        // Opacity decreases along trail
        opacities[index] = 1 * trailFactor;
      }
    }
    
    return { positions, colors, sizes, opacities };
  }, [count, trailLength, size, color]);
  
  // Previous trail positions for each particle group
  const trails = useRef<Array<Array<[number, number, number]>>>([]);
  
  // Initialize trails array
  useEffect(() => {
    trails.current = Array(count)
      .fill(0)
      .map(() => 
        Array(trailLength)
          .fill(0)
          .map(() => [0, 0, 0] as [number, number, number])
      );
  }, [count, trailLength]);
  
  // Animation loop
  useFrame(({ clock }) => {
    if (!particlesRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    
    // Get current mouse position
    const mousePos = getMousePosition();
    
    // Update each particle group
    for (let i = 0; i < count; i++) {
      // Get trail array for this particle
      const trail = trails.current[i];
      
      // Calculate base position with some variation for each particle group
      const angle = time * 0.2 + (i / count) * Math.PI * 2;
      const noise = Math.sin(time * 0.5 + i * 0.2) * 0.2;
      
      // Target position: combination of mouse position and circular motion
      // This creates movement that both follows the mouse and has its own organic flow
      const targetX = mousePos[0] + Math.cos(angle) * (1 + noise);
      const targetY = mousePos[1] + Math.sin(angle) * (1 + noise);
      const targetZ = mousePos[2];
      
      // Update head of trail (smoothly follow target)
      const headX = trail[0][0] + (targetX - trail[0][0]) * followSpeed;
      const headY = trail[0][1] + (targetY - trail[0][1]) * followSpeed;
      const headZ = trail[0][2] + (targetZ - trail[0][2]) * followSpeed;
      
      // Set new head position
      trail[0] = [headX, headY, headZ];
      
      // Update rest of trail (each point follows the one before it)
      for (let j = 1; j < trailLength; j++) {
        const prevX = trail[j-1][0];
        const prevY = trail[j-1][1];
        const prevZ = trail[j-1][2];
        
        // Follow previous point with lag
        const followFactor = 0.3;
        trail[j][0] += (prevX - trail[j][0]) * followFactor;
        trail[j][1] += (prevY - trail[j][1]) * followFactor;
        trail[j][2] += (prevZ - trail[j][2]) * followFactor;
      }
      
      // Update positions buffer from trail data
      for (let j = 0; j < trailLength; j++) {
        const index = i * trailLength + j;
        const i3 = index * 3;
        
        positions[i3] = trail[j][0];
        positions[i3 + 1] = trail[j][1];
        positions[i3 + 2] = trail[j][2];
        
        // Fade color along trail and based on head velocity
        const trailFactor = 1 - j / trailLength;
        const headVelocity = Math.abs(trail[0][0] - trail[1][0]) + 
                            Math.abs(trail[0][1] - trail[1][1]);
        const intensity = Math.min(1.0, trailFactor * (1 + headVelocity * 3));
        
        const baseColor = new THREE.Color(color);
        
        // Make faster movements more intense in color
        colors[i3] = baseColor.r * intensity;
        colors[i3 + 1] = baseColor.g * intensity;
        colors[i3 + 2] = baseColor.b * intensity;
      }
    }
    
    // Update buffers
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * trailLength}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count * trailLength}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count * trailLength}
          array={particles.sizes}
          itemSize={1}
          normalized={false}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleTrails;