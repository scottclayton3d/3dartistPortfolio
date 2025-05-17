import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';

// This component implements a full-screen raymarching shader
const RaymarchEffect = ({ 
  colorPalette = ['#ff3366', '#121212', '#00ffd1'],
  noiseIntensity = 0.5
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mousePosition = useMousePosition();
  
  // Create shader uniforms
  const uniforms = useRef({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(size.width, size.height) },
    color1: { value: new THREE.Color(colorPalette[0]) },
    color2: { value: new THREE.Color(colorPalette[1]) },
    color3: { value: new THREE.Color(colorPalette[2]) },
    noiseIntensity: { value: noiseIntensity },
    mousePosition: { value: new THREE.Vector2(0.5, 0.5) }
  });
  
  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
      materialRef.current.uniforms.mousePosition.value.set(
        mousePosition.relativeX * 0.5 + 0.5,
        mousePosition.relativeY * 0.5 + 0.5
      );
    }
  });
  
  // Update resolution uniform when window size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
    }
  }, [size]);
  
  // Vertex shader - simple pass-through
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={'https://raw.githubusercontent.com/gkjohnson/three-sketches/main/background-vertex-anim/src/glsl/noise.fs.glsl'}
        uniforms={uniforms.current}
      />
    </mesh>
  );
};

export default RaymarchEffect;