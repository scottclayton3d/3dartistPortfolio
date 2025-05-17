import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CustomShaderProps {
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: Record<string, THREE.IUniform>;
  children?: React.ReactNode;
  wireframe?: boolean;
  transparent?: boolean;
  side?: THREE.Side;
}

/**
 * A component that applies custom GLSL shaders to its children
 */
export const CustomShader: React.FC<CustomShaderProps> = ({
  fragmentShader,
  vertexShader,
  uniforms = {},
  children,
  wireframe = false,
  transparent = false,
  side = THREE.FrontSide
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Default shaders if none provided
  const defaultVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const defaultFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      // Simple gradient based on UV coordinates
      vec3 color = mix(uColor, uColor * 0.5, vUv.y);
      
      // Add some time-based animation
      float pulse = (sin(uTime * 2.0) * 0.5 + 0.5) * 0.2 + 0.8;
      color *= pulse;
      
      // Simple lighting based on normals
      float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
      lighting = pow(lighting * 0.5 + 0.5, 2.0);
      color *= lighting;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  
  // Create default uniforms
  const defaultUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x6b8e23) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  }), []);
  
  // Merge the default uniforms with custom uniforms
  const mergedUniforms = useMemo(() => {
    return { ...defaultUniforms, ...uniforms };
  }, [defaultUniforms, uniforms]);
  
  // Update time uniform on each frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(
          window.innerWidth, 
          window.innerHeight
        );
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader || defaultVertexShader}
      fragmentShader={fragmentShader || defaultFragmentShader}
      uniforms={mergedUniforms}
      wireframe={wireframe}
      transparent={transparent}
      side={side}
    >
      {children}
    </shaderMaterial>
  );
};

export default CustomShader;