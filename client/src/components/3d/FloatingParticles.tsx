import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { useMousePosition } from '@/hooks/useMousePosition';

interface FloatingParticlesProps {
  count?: number;
  radius?: number;
  size?: number;
  color?: string;
  trailLength?: number;
  enableTrails?: boolean;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 10,
  radius = 1,
  size = 0.0005,
  color = '#FF3366',
  trailLength = 8,
  enableTrails = true
}) => {
  const { animationEnabled } = usePortfolio();
  const mouse = useMousePosition();
  const particlesRef = useRef<THREE.Points>(null);
  
  // Store previous positions for each particle to create trails
  const particleTrails = useRef<Array<Array<[number, number, number]>>>([]);
  
  // Initialize the trails array
  useEffect(() => {
    if (enableTrails) {
      particleTrails.current = Array(count)
        .fill(0)
        .map(() => 
          Array(trailLength)
            .fill(0)
            .map(() => [0, 0, 0] as [number, number, number])
        );
    }
  }, [count, trailLength, enableTrails]);
  
  // Create particle and trail positions
  const particles = useMemo(() => {
    // If trails are enabled, we need positions for each particle plus its trail
    const totalPoints = enableTrails ? count * trailLength : count;
    
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const sizes = new Float32Array(totalPoints);
    const particleColor = new THREE.Color(color);
    
    // For each main particle
    for (let i = 0; i < count; i++) {
      // Create random positions in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // If trails are enabled, initialize each particle and its trail
      if (enableTrails) {
        for (let j = 0; j < trailLength; j++) {
          const index = i * trailLength + j;
          const i3 = index * 3;
          
          // All trail points start at the same position
          positions[i3] = x;
          positions[i3 + 1] = y;
          positions[i3 + 2] = z;
          
          // Color fades along the trail
          const trailFactor = 1 - j / trailLength;
          colors[i3] = particleColor.r;
          colors[i3 + 1] = particleColor.g;
          colors[i3 + 2] = particleColor.b;
          
          // Size decreases along the trail
          sizes[index] = size * (0.0007 * (j / trailLength));
          
          // Store the initial position in the trails array
          if (particleTrails.current[i]) {
            particleTrails.current[i][j] = [x, y, z];
          }
        }
      } 
      // Without trails, just set the single particle
      else {
        const i3 = i * 3;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Add slight color variation
        const colorVariation = 0.1;
        colors[i3] = particleColor.r * (1 + Math.random() * colorVariation - colorVariation / 2);
        colors[i3 + 1] = particleColor.g * (1 + Math.random() * colorVariation - colorVariation / 2);
        colors[i3 + 2] = particleColor.b * (1 + Math.random() * colorVariation - colorVariation / 2);
        
        sizes[i] = size;
      }
    }
    
    return { positions, colors, sizes };
  }, [count, radius, size, color, trailLength, enableTrails]);
  
  // Animation
  useFrame(({ clock }) => {
    if (!particlesRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    
    // For each main particle
    for (let i = 0; i < count; i++) {
      // With trails enabled, handle the main particle and its trail
      if (enableTrails) {
        // Handle the head of the trail (main particle)
        const headIndex = i * trailLength;
        const headIdx3 = headIndex * 3;
        
        // Get current head position
        const currentX = positions[headIdx3];
        const currentY = positions[headIdx3 + 1];
        const currentZ = positions[headIdx3 + 2];
        
        // Calculate new position with gentle oscillation
        const basicX = currentX + Math.sin(time * 0.2 + i * 0.1) * 0.01;
        const basicY = currentY + Math.cos(time * 0.2 + i * 0.05) * 0.01;
        const basicZ = currentZ + Math.sin(time * 0.2 + i * 0.02) * 0.01;
        
        let newX = basicX;
        let newY = basicY;
        let newZ = basicZ;
        
        // Apply mouse influence
        if (mouse) {
          const mouseX = mouse.relativeX || 0;
          const mouseY = mouse.relativeY || 0;
          
          // Calculate distance to mouse
          const dx = currentX - mouseX * radius;
          const dy = currentY - mouseY * radius;
          const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
          
          // Mouse influence decreases with distance
          const mouseInfluence = Math.max(0, 1 - distanceToMouse / radius);
          
          // Particles react differently based on distance
          if (distanceToMouse < radius * 0.3) {
            // Close particles get repelled
            const repulsionStrength = 0.05 * mouseInfluence;
            const safeDistance = Math.max(0.1, distanceToMouse);
            
            newX += (dx / safeDistance) * repulsionStrength;
            newY += (dy / safeDistance) * repulsionStrength;
          } else {
            // Far particles get slight attraction
            const attractionStrength = 0.01 * mouseInfluence;
            
            newX -= dx * attractionStrength;
            newY -= dy * attractionStrength;
          }
          
          // Add some vertical movement based on mouse activity
          const mouseActivity = Math.abs(mouseX) + Math.abs(mouseY);
          newZ += mouseActivity * 0.01 * Math.sin(time + i);
        }
        
        // Update the head position in our buffer
        positions[headIdx3] = newX;
        positions[headIdx3 + 1] = newY;
        positions[headIdx3 + 2] = newZ;
        
        // Store this position in the trails array
        if (particleTrails.current[i]) {
          particleTrails.current[i][0] = [newX, newY, newZ];
        }
        
        // Update the rest of the trail
        for (let j = 1; j < trailLength; j++) {
          const trailIndex = i * trailLength + j;
          const trailIdx3 = trailIndex * 3;
          
          // Each point in the trail follows the previous point with a delay
          const prevPoint = particleTrails.current[i][j-1];
          const currentPoint = particleTrails.current[i][j];
          
          // Smooth follow with easing
          const followSpeed = 0.4 - (j / trailLength) * 0.2; // Slower at the end of trail
          const newTrailX = currentPoint[0] + (prevPoint[0] - currentPoint[0]) * followSpeed;
          const newTrailY = currentPoint[1] + (prevPoint[1] - currentPoint[1]) * followSpeed;
          const newTrailZ = currentPoint[2] + (prevPoint[2] - currentPoint[2]) * followSpeed;
          
          // Update the trail position
          positions[trailIdx3] = newTrailX;
          positions[trailIdx3 + 1] = newTrailY;
          positions[trailIdx3 + 2] = newTrailZ;
          
          // Store the updated position
          particleTrails.current[i][j] = [newTrailX, newTrailY, newTrailZ];
          
          // Calculate the speed of the particle (for color intensity)
          const speed = Math.sqrt(
            Math.pow(newTrailX - currentPoint[0], 2) +
            Math.pow(newTrailY - currentPoint[1], 2) +
            Math.pow(newTrailZ - currentPoint[2], 2)
          );
          
          // Make faster moving trails brighter
          const baseColor = new THREE.Color(color);
          const trailFactor = 1 - j / trailLength;
          const speedFactor = Math.min(1, speed * 50);
          const brightness = trailFactor * (0.6 + speedFactor * 0.4);
          
          colors[trailIdx3] = baseColor.r * brightness;
          colors[trailIdx3 + 1] = baseColor.g * brightness;
          colors[trailIdx3 + 2] = baseColor.b * brightness;
        }
      } 
      // Without trails, just update the single particle
      else {
        const i3 = i * 3;
        
        // Get current position
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Apply basic motion
        const basicX = x + Math.sin(time * 0.2 + i * 0.1) * 0.01;
        const basicY = y + Math.cos(time * 0.2 + i * 0.05) * 0.01;
        const basicZ = z + Math.sin(time * 0.2 + i * 0.02) * 0.01;
        
        // Apply mouse influence if available
        if (mouse) {
          const mouseX = mouse.relativeX || 0;
          const mouseY = mouse.relativeY || 0;
          
          const dx = x - mouseX * radius;
          const dy = y - mouseY * radius;
          const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
          
          const mouseInfluence = Math.max(0, 1 - distanceToMouse / radius);
          const mouseAmplitude = 0.03 * mouseInfluence;
          
          const safeDistance = distanceToMouse === 0 ? 0.001 : distanceToMouse;
          
          positions[i3] = basicX + (dx / safeDistance) * mouseAmplitude;
          positions[i3 + 1] = basicY + (dy / safeDistance) * mouseAmplitude;
          positions[i3 + 2] = basicZ + Math.sin(time + i * 0.1) * mouseInfluence * 0.02;
        } else {
          positions[i3] = basicX;
          positions[i3 + 1] = basicY;
          positions[i3 + 2] = basicZ;
        }
      }
    }
    
    // Update the buffers
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={enableTrails ? count * trailLength : count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={enableTrails ? count * trailLength : count}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={enableTrails ? count * trailLength : count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
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
