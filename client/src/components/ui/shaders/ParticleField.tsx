import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { useMousePosition } from '@/hooks/useMousePosition';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  radius?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 200,
  color = '#FF3366',
  radius = 10,
  minSize = 0.03,
  maxSize = 0.12,
  speed = 0.2
}) => {
  const { animationEnabled } = usePortfolio();
  const mousePosition = useMousePosition();
  const meshRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create geometry and material data
  const { positions, scales, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Random scales
      scales[i] = Math.random() * (maxSize - minSize) + minSize;
      
      // Slightly varied colors
      const colorVariation = 0.2;
      colors[i * 3] = baseColor.r * (1 + (Math.random() * colorVariation - colorVariation/2));
      colors[i * 3 + 1] = baseColor.g * (1 + (Math.random() * colorVariation - colorVariation/2));
      colors[i * 3 + 2] = baseColor.b * (1 + (Math.random() * colorVariation - colorVariation/2));
    }
    
    return { positions, scales, colors };
  }, [count, radius, color, minSize, maxSize]);
  
  // Update shader uniforms each frame
  useFrame(({ clock }) => {
    if (!meshRef.current || !shaderRef.current || !animationEnabled) return;
    
    // Update time uniform
    shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    
    // Update mouse position for interactivity
    shaderRef.current.uniforms.uMouse.value.x = mousePosition.x;
    shaderRef.current.uniforms.uMouse.value.y = mousePosition.y;
    
    // Rotate the entire field slowly
    meshRef.current.rotation.y += 0.001;
    meshRef.current.rotation.x += 0.0005;
  });
  
  // Create shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: 6.0 },
    uColor: { value: new THREE.Color(color) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [color]);
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={positions.length / 3} 
          array={positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-aScale" 
          count={scales.length} 
          array={scales} 
          itemSize={1} 
        />
        <bufferAttribute 
          attach="attributes-aColor" 
          count={colors.length / 3} 
          array={colors} 
          itemSize={3} 
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        uniforms={uniforms}
        vertexShader="/shaders/vertex.glsl"
        fragmentShader="/shaders/fragment.glsl"
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleField;
