import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';

const AbstractBackground = ({ 
  colorPalette = ['#ff3366', '#121212', '#00ffd1'] 
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
  
  // Vertex shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  // Fragment shader
  const fragmentShader = `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform vec2 mousePosition;
    varying vec2 vUv;
    
    // Noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Use mouse position to influence the noise pattern
      float mouseInfluence = 0.4;
      vec2 mouseUV = (mousePosition * 2.0 - 1.0) * mouseInfluence;
      
      // Create flowing noise fields
      float n1 = snoise(vec2(uv.x * 3.0 + time * 0.2 + mouseUV.x, uv.y * 3.0 - time * 0.1 + mouseUV.y));
      float n2 = snoise(vec2(uv.x * 5.0 - time * 0.3, uv.y * 5.0 + time * 0.2));
      float n3 = snoise(vec2(uv.x * 8.0 + time * 0.4, uv.y * 8.0 - time * 0.3));
      
      // Combine noise layers
      float combinedNoise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 0.6 + 0.4;
      
      // Create gradient background
      vec3 gradientColor = mix(color1, color2, uv.y);
      gradientColor = mix(gradientColor, color3, length(uv - 0.5) * 1.2);
      
      // Apply noise as glow/color variation
      vec3 finalColor = mix(gradientColor, color3, combinedNoise * 0.5);
      
      // Add subtle pulsing effect
      float pulse = (sin(time) * 0.5 + 0.5) * 0.2;
      finalColor += color1 * pulse * (1.0 - length(uv - 0.5));
      
      // Vignette effect
      float vignette = 1.0 - dot((uv - 0.5) * 1.2, (uv - 0.5) * 1.2);
      vignette = pow(vignette, 1.5);
      finalColor *= vignette;
      
      // Output final color
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
};

export default AbstractBackground;