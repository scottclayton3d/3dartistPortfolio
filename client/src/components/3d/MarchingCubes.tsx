import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMousePosition } from '@/hooks/useMousePosition';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface MarchingCubesProps {
  colorPalette?: string[];
  position?: [number, number, number];
  scale?: number;
}

const MarchingCubes: React.FC<MarchingCubesProps> = ({
  colorPalette = ['#ff2d92', '#a855f7', '#00d1c3'],
  position = [0, 0, 0],
  scale = 1.5
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePosition = useMousePosition();
  const { animationEnabled } = usePortfolio();
  
  // Create material with enhanced color palette
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: colorPalette[0],
      roughness: 0.1,
      metalness: 0.8,
      reflectivity: 0.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      emissive: new THREE.Color(colorPalette[2]).multiplyScalar(0.2),
    });
  }, [colorPalette]);
  
  // Create a geometric shape that simulates marching cubes effect
  const geometry = useMemo(() => {
    // Create a base sphere to modify
    const baseGeometry = new THREE.IcosahedronGeometry(1, 4);
    
    // Deform the sphere to create an organic "marching cubes" look
    const positions = baseGeometry.attributes.position as THREE.BufferAttribute;
    const count = positions.count;
    
    // Add noise to the vertices to make it look like marching cubes
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);
      
      // Noise based on position
      const noise = 0.2 * Math.sin(x * 5) * Math.cos(y * 3) * Math.sin(z * 4);
      
      // Apply noise to vertices based on distance from center
      const factor = 1 + noise * (1 - Math.min(1, distance));
      
      positions.setX(i, x * factor);
      positions.setY(i, y * factor);
      positions.setZ(i, z * factor);
    }
    
    // Recalculate normals after deformation
    baseGeometry.computeVertexNormals();
    
    return baseGeometry;
  }, []);
  
  // Animate the mesh
  useFrame(({ clock }) => {
    if (!meshRef.current || !animationEnabled) return;
    
    const time = clock.getElapsedTime();
    
    // Rotate the mesh
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;
    
    // Apply enhanced mouse influence with distance-based effect
    const mouseInfluence = 1.0;
    const targetX = position[0] + mousePosition.relativeX * mouseInfluence;
    const targetY = position[1] + mousePosition.relativeY * mouseInfluence;
    
    // Create smooth follow with easing
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    
    // Add repulsion effect when mouse is very close to the object
    const mouseWorldX = mousePosition.relativeX * 3; // Scale to world coordinates
    const mouseWorldY = mousePosition.relativeY * 3;
    const distanceToMouse = Math.sqrt(
      Math.pow(meshRef.current.position.x - mouseWorldX, 2) + 
      Math.pow(meshRef.current.position.y - mouseWorldY, 2)
    );
    
    // Apply repulsion if mouse is close
    if (distanceToMouse < 1) {
      const repulsionStrength = 0.05 * (1 - distanceToMouse);
      const dirX = meshRef.current.position.x - mouseWorldX;
      const dirY = meshRef.current.position.y - mouseWorldY;
      const length = Math.sqrt(dirX * dirX + dirY * dirY) || 0.001;
      
      meshRef.current.position.x += (dirX / length) * repulsionStrength;
      meshRef.current.position.y += (dirY / length) * repulsionStrength;
    }
    
    // Subtle pulsing effect
    const pulse = Math.sin(time) * 0.05 + 1;
    meshRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
    
    // Gradually change the material color between the palette colors
    const colorIndex = Math.floor(time * 0.2) % colorPalette.length;
    const nextColorIndex = (colorIndex + 1) % colorPalette.length;
    const blend = (time * 0.2) % 1;
    
    const color1 = new THREE.Color(colorPalette[colorIndex]);
    const color2 = new THREE.Color(colorPalette[nextColorIndex]);
    const blendedColor = color1.clone().lerp(color2, blend);
    
    (meshRef.current.material as THREE.MeshPhysicalMaterial).color = blendedColor;
    (meshRef.current.material as THREE.MeshPhysicalMaterial).emissive = blendedColor.clone().multiplyScalar(0.2);
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      castShadow
      receiveShadow
    />
  );
};

export default MarchingCubes;