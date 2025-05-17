import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { ShaderUniforms } from '@/types';

interface ColorShiftProps {
  intensity?: number;
  color?: string;
  speed?: number;
}

// Custom shader material for color shifting effect
const ColorShift: React.FC<ColorShiftProps> = ({
  intensity = 0.5,
  color = '#FF3366',
  speed = 0.3
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const { animationEnabled } = usePortfolio();
  
  // Create uniforms for the shader
  const uniforms = useRef<ShaderUniforms>({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    uIntensity: { value: intensity }
  });
  
  // Update shader uniforms each frame
  useFrame(({ clock }) => {
    if (!materialRef.current || !animationEnabled) return;
    
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  
  // Update uniforms when props change
  useEffect(() => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uColor.value = new THREE.Color(color);
    materialRef.current.uniforms.uIntensity.value = intensity;
  }, [color, intensity]);
  
  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms.current}
        vertexShader={`
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec2 uResolution;
          uniform float uIntensity;
          
          varying vec2 vUv;
          
          void main() {
            // Gradient based on UV coordinates
            vec2 uv = vUv;
            
            // Create a shifting color effect
            float timeShift = uTime * ${speed};
            
            // Create a noise pattern
            vec2 p = uv * 8.0;
            float noise = sin(p.x + timeShift) * sin(p.y + timeShift * 0.5);
            
            // Mix with base color
            vec3 color = mix(vec3(0.1, 0.1, 0.2), uColor, noise * uIntensity);
            
            // Vignette effect
            float vignette = 1.0 - length(uv - 0.5) * 1.3;
            vignette = smoothstep(0.0, 1.0, vignette);
            
            gl_FragColor = vec4(color * vignette, 0.15);
          }
        `}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default ColorShift;
