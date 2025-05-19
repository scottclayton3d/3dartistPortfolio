
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { useMousePosition } from '@/hooks/useMousePosition';

interface FloatingParticlesProps {
  count?: number;
  radius?: number;
  size?: number;
  baseColor?: string;
  trailLength?: number;
  enableTrails?: boolean;
  interactionRadius?: number;
  repulsionStrength?: number;
  attractionStrength?: number;
  colorVariation?: number;
  pulseFrequency?: number;
  pulseAmplitude?: number;
  swarmBehavior?: boolean;
  noiseIntensity?: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 50,
  radius = 2,
  size = 0.004,
  baseColor = '#FF3366',
  trailLength = 12,
  enableTrails = true,
  interactionRadius = 0.5,
  repulsionStrength = 0.08,
  attractionStrength = 0.02,
  colorVariation = 0.3,
  pulseFrequency = 0.5,
  pulseAmplitude = 0.2,
  swarmBehavior = true,
  noiseIntensity = 0.02
}) => {
  const { animationEnabled } = usePortfolio();
  const mouse = useMousePosition();
  const particlesRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  
  // Store velocities for each particle
  const velocities = useRef<Array<[number, number, number]>>([]);
  const particleTrails = useRef<Array<Array<[number, number, number]>>>([]);
  
  // Initialize arrays
  useEffect(() => {
    velocities.current = Array(count).fill(0).map(() => [0, 0, 0]);
    if (enableTrails) {
      particleTrails.current = Array(count).fill(0).map(() => 
        Array(trailLength).fill(0).map(() => [0, 0, 0] as [number, number, number])
      );
    }
  }, [count, trailLength, enableTrails]);

  // Generate complementary colors
  const complementaryColors = useMemo(() => {
    const baseColorObj = new THREE.Color(baseColor);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColorObj.getHSL(hsl);
    
    return [
      new THREE.Color().setHSL((hsl.h + 0.5) % 1, hsl.s, hsl.l),
      new THREE.Color().setHSL((hsl.h + 0.33) % 1, hsl.s, hsl.l),
      new THREE.Color().setHSL((hsl.h + 0.67) % 1, hsl.s, hsl.l)
    ];
  }, [baseColor]);

  // Create particles with initial properties
  const particles = useMemo(() => {
    const totalPoints = enableTrails ? count * trailLength : count;
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const sizes = new Float32Array(totalPoints);
    const opacities = new Float32Array(totalPoints);
    
    for (let i = 0; i < count; i++) {
      // Distribute particles in a sphere using spherical coordinates
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      if (enableTrails) {
        for (let j = 0; j < trailLength; j++) {
          const index = i * trailLength + j;
          const i3 = index * 3;
          
          positions[i3] = x;
          positions[i3 + 1] = y;
          positions[i3 + 2] = z;
          
          // Dynamic color blending
          const colorIndex = i % complementaryColors.length;
          const baseColorObj = new THREE.Color(baseColor);
          const complementaryColor = complementaryColors[colorIndex];
          const blendFactor = Math.random();
          const particleColor = new THREE.Color().lerpColors(
            baseColorObj,
            complementaryColor,
            blendFactor
          );
          
          const trailFactor = 1 - j / trailLength;
          colors[i3] = particleColor.r * trailFactor;
          colors[i3 + 1] = particleColor.g * trailFactor;
          colors[i3 + 2] = particleColor.b * trailFactor;
          
          sizes[index] = size * (1 - 0.5 * (j / trailLength));
          opacities[index] = trailFactor;
          
          if (particleTrails.current[i]) {
            particleTrails.current[i][j] = [x, y, z];
          }
        }
      } else {
        const i3 = i * 3;
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        const colorIndex = i % complementaryColors.length;
        const colorVariationFactor = 1 + (Math.random() * colorVariation - colorVariation / 2);
        colors[i3] = complementaryColors[colorIndex].r * colorVariationFactor;
        colors[i3 + 1] = complementaryColors[colorIndex].g * colorVariationFactor;
        colors[i3 + 2] = complementaryColors[colorIndex].b * colorVariationFactor;
        
        sizes[i] = size;
        opacities[i] = 1;
      }
    }
    
    return { positions, colors, sizes, opacities };
  }, [count, radius, size, baseColor, trailLength, enableTrails, complementaryColors, colorVariation]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!particlesRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    const mouseWorldPos = new THREE.Vector3(
      (mouse.relativeX || 0) * radius,
      (mouse.relativeY || 0) * radius,
      0
    ).unproject(camera);

    // Update each particle
    for (let i = 0; i < count; i++) {
      const headIndex = enableTrails ? i * trailLength : i;
      const headIdx3 = headIndex * 3;
      
      // Current position
      const currentX = positions[headIdx3];
      const currentY = positions[headIdx3 + 1];
      const currentZ = positions[headIdx3 + 2];
      
      // Calculate forces
      let fx = 0, fy = 0, fz = 0;
      
      // Mouse interaction
      const dx = currentX - mouseWorldPos.x;
      const dy = currentY - mouseWorldPos.y;
      const dz = currentZ - mouseWorldPos.z;
      const distToMouse = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distToMouse < interactionRadius) {
        const force = (1 - distToMouse / interactionRadius) * repulsionStrength;
        fx += dx * force;
        fy += dy * force;
        fz += dz * force;
      }
      
      // Swarm behavior
      if (swarmBehavior) {
        for (let j = 0; j < count; j++) {
          if (i !== j) {
            const otherIdx3 = enableTrails ? j * trailLength * 3 : j * 3;
            const ox = positions[otherIdx3] - currentX;
            const oy = positions[otherIdx3 + 1] - currentY;
            const oz = positions[otherIdx3 + 2] - currentZ;
            const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
            
            if (dist < radius * 0.2) {
              const force = (dist / (radius * 0.2)) * attractionStrength;
              fx += ox * force;
              fy += oy * force;
              fz += oz * force;
            }
          }
        }
      }
      
      // Noise and pulsing
      const noise = Math.sin(time * pulseFrequency + i) * pulseAmplitude;
      fx += (Math.random() - 0.5) * noiseIntensity + noise;
      fy += (Math.random() - 0.5) * noiseIntensity + noise;
      fz += (Math.random() - 0.5) * noiseIntensity + noise;
      
      // Update velocity with forces
      velocities.current[i][0] += fx;
      velocities.current[i][1] += fy;
      velocities.current[i][2] += fz;
      
      // Apply damping
      velocities.current[i][0] *= 0.95;
      velocities.current[i][1] *= 0.95;
      velocities.current[i][2] *= 0.95;
      
      // Update position
      const newX = currentX + velocities.current[i][0];
      const newY = currentY + velocities.current[i][1];
      const newZ = currentZ + velocities.current[i][2];
      
      // Boundary check
      const dist = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
      if (dist > radius) {
        const scale = radius / dist;
        velocities.current[i][0] *= -0.5;
        velocities.current[i][1] *= -0.5;
        velocities.current[i][2] *= -0.5;
      }
      
      if (enableTrails) {
        // Update trail positions
        for (let j = trailLength - 1; j > 0; j--) {
          const currentIndex = i * trailLength + j;
          const prevIndex = i * trailLength + j - 1;
          const i3Current = currentIndex * 3;
          const i3Prev = prevIndex * 3;
          
          positions[i3Current] = positions[i3Prev];
          positions[i3Current + 1] = positions[i3Prev + 1];
          positions[i3Current + 2] = positions[i3Prev + 2];
          
          // Dynamic color based on velocity
          const speed = Math.sqrt(
            velocities.current[i][0] * velocities.current[i][0] +
            velocities.current[i][1] * velocities.current[i][1] +
            velocities.current[i][2] * velocities.current[i][2]
          );
          
          const trailFactor = 1 - j / trailLength;
          const intensityBoost = Math.min(1, speed * 5);
          
          colors[i3Current] *= trailFactor * (1 + intensityBoost);
          colors[i3Current + 1] *= trailFactor * (1 + intensityBoost);
          colors[i3Current + 2] *= trailFactor * (1 + intensityBoost);
        }
        
        // Update head position
        positions[headIdx3] = newX;
        positions[headIdx3 + 1] = newY;
        positions[headIdx3 + 2] = newZ;
      } else {
        positions[headIdx3] = newX;
        positions[headIdx3 + 1] = newY;
        positions[headIdx3 + 2] = newZ;
      }
    }
    
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
