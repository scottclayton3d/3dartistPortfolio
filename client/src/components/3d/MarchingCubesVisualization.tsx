import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MarchingCubes, MarchingCube, useHelper } from '@react-three/drei';
import { useMousePosition } from '@/hooks/useMousePosition';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { Object3D } from 'three';

interface MarchingCubesVisualizationProps {
  resolution?: number;
  scale?: number;
  colorPalette?: string[];
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const MarchingCubesVisualization: React.FC<MarchingCubesVisualizationProps> = ({
  resolution = 28,
  scale = 3,
  colorPalette = ['#ff2d92', '#a855f7', '#00d1c3'],
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}) => {
  const marchingRef = useRef<THREE.Mesh>(null);
  const mousePosition = useMousePosition();
  const { animationEnabled } = usePortfolio();
  
  // Create materials with our enhanced color palette
  const materials = useMemo(() => {
    return colorPalette.map(color => 
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.1,
        metalness: 0.8,
        reflectivity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.3,
        emissive: new THREE.Color(color).multiplyScalar(0.2),
        transparent: true,
        opacity: 0.9,
      })
    );
  }, [colorPalette]);
  
  // Configuration for metaball effects
  const balls = useMemo(() => {
    return [
      { position: [0, 0, 0], strength: 1.0, subtract: 0, radius: 0.8 },
      { position: [1, 0, 0], strength: 0.6, subtract: 0, radius: 0.7 },
      { position: [0, 1, 0], strength: 0.7, subtract: 0, radius: 0.6 },
      { position: [0, 0, 1], strength: 0.8, subtract: 0, radius: 0.5 },
      { position: [0.5, 0.5, 0.5], strength: 0.9, subtract: 0, radius: 0.6 },
      { position: [-0.5, -0.5, -0.5], strength: 0.7, subtract: 0, radius: 0.7 },
      { position: [-1, 0, 0], strength: 0.8, subtract: 0, radius: 0.6 },
      { position: [0, -1, 0], strength: 0.7, subtract: 0, radius: 0.5 },
      { position: [0, 0, -1], strength: 0.6, subtract: 0, radius: 0.8 },
    ];
  }, []);
  
  // Animate the marching cubes
  useFrame(({ clock }) => {
    if (!marchingRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    
    // Update each metaball's position based on time
    balls.forEach((ball, i) => {
      const [x, y, z] = ball.position;
      const meshes = marchingRef.current?.children || [];
      
      if (meshes[i] && meshes[i] instanceof THREE.Mesh) {
        // Movement patterns with different frequencies and amplitudes
        const freq = 0.15 + i * 0.05;
        const amp = 0.8 + i * 0.1;
        
        const newX = x + Math.sin(time * freq) * amp;
        const newY = y + Math.cos(time * (freq + 0.1)) * amp;
        const newZ = z + Math.sin(time * (freq + 0.2)) * amp;
        
        // Apply mouse influence to the nearest metaballs
        const distanceToMouse = Math.sqrt(
          Math.pow(newX - mousePosition.relativeX * 2, 2) +
          Math.pow(newY - mousePosition.relativeY * 2, 2)
        );
        
        // Mouse influence decreases with distance
        const mouseInfluence = Math.max(0, 1 - distanceToMouse / 3);
        
        // Apply mouse repulsion to avoid cursor
        if (mouseInfluence > 0.1) {
          const repulsionFactor = 0.3 * mouseInfluence;
          const dirX = newX - mousePosition.relativeX * 2;
          const dirY = newY - mousePosition.relativeY * 2;
          
          // Normalized direction vector
          const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
          
          // Apply repulsion
          (meshes[i] as THREE.Mesh).position.x = newX + (dirX / len) * repulsionFactor;
          (meshes[i] as THREE.Mesh).position.y = newY + (dirY / len) * repulsionFactor;
          (meshes[i] as THREE.Mesh).position.z = newZ;
        } else {
          // Normal movement if mouse is far away
          (meshes[i] as THREE.Mesh).position.x = newX;
          (meshes[i] as THREE.Mesh).position.y = newY;
          (meshes[i] as THREE.Mesh).position.z = newZ;
        }
        
        // Apply slow rotation to each metaball
        (meshes[i] as THREE.Mesh).rotation.x = time * (0.1 + i * 0.01);
        (meshes[i] as THREE.Mesh).rotation.y = time * (0.15 + i * 0.01);
      }
    });
    
    // Rotate the entire marching cubes object slowly
    marchingRef.current.rotation.y = time * 0.05;
  });

  return (
    <group position={position} rotation={rotation}>
      <MarchingCubes ref={marchingRef} resolution={resolution} maxPolyCount={20000} enableUvs={false} enableColors scale={scale}>
        {balls.map((ball, i) => (
          <MarchingCube
            key={i}
            position={ball.position}
            strength={ball.strength}
            subtract={ball.subtract}
            radius={ball.radius}
            material={materials[i % materials.length]}
          />
        ))}
      </MarchingCubes>
    </group>
  );
};

export default MarchingCubesVisualization;