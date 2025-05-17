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
    
    // 3D Noise function (combination of 2D noise for 3D effect)
    float noise3D(vec3 p) {
      float xy = snoise(p.xy);
      float yz = snoise(p.yz + vec2(43.84, 75.28));
      float zx = snoise(p.zx + vec2(94.53, 15.72));
      return (xy + yz + zx) / 3.0;
    }
    
    // Light calculation for specular reflection
    vec3 calculateSpecular(vec3 normal, vec3 viewDir, vec3 lightDir, vec3 lightColor, float shininess) {
      vec3 halfwayDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
      return lightColor * spec;
    }
    
    // HSL to RGB conversion
    vec3 hsl2rgb(vec3 c) {
      vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create view direction for specular calculation
      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      
      // Use mouse position to influence the noise pattern with more responsiveness
      float mouseInfluence = 0.6;
      vec2 mouseUV = (mousePosition * 2.0 - 1.0) * mouseInfluence;
      
      // Create dynamic flowing noise fields with more variation
      float timeScale = time * 0.3;
      float n1 = snoise(vec2(uv.x * 3.0 + timeScale + mouseUV.x, uv.y * 3.0 - timeScale * 0.7 + mouseUV.y));
      float n2 = snoise(vec2(uv.x * 5.0 - timeScale * 1.1, uv.y * 5.0 + timeScale * 0.8));
      float n3 = snoise(vec2(uv.x * 8.0 + timeScale * 1.5, uv.y * 8.0 - timeScale * 0.9));
      float n4 = snoise(vec2(uv.x * 12.0 - timeScale * 0.4, uv.y * 12.0 + timeScale * 0.3)); // Higher frequency detail
      
      // Combine noise layers with different weightings
      float combinedNoise = (n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1) * 0.7 + 0.3;
      
      // Create gradient background with more color variation
      float hueShift = time * 0.05; // Subtle hue shift over time
      vec3 color1Shifted = hsl2rgb(vec3(fract(hueShift + 0.0), 0.7, 0.5)); // Animated hue
      vec3 color3Shifted = hsl2rgb(vec3(fract(hueShift + 0.3), 0.7, 0.5)); // Animated hue with offset
      
      // Mix original colors with shifted ones for subtle animation
      vec3 c1 = mix(color1, color1Shifted, 0.3);
      vec3 c3 = mix(color3, color3Shifted, 0.3);
      
      // Create dynamic gradient background
      vec3 gradientColor = mix(c1, color2, uv.y + sin(uv.x * 4.0 + time) * 0.1);
      gradientColor = mix(gradientColor, c3, length(uv - 0.5) * 1.2);
      
      // Calculate pseudo-normals from noise for specular effect
      float eps = 0.01;
      float nx = combinedNoise - snoise(vec2(uv.x + eps, uv.y));
      float ny = combinedNoise - snoise(vec2(uv.x, uv.y + eps));
      vec3 normal = normalize(vec3(nx, ny, 0.5));
      
      // Dynamic light positions that move over time
      vec3 lightDir1 = normalize(vec3(sin(time * 0.5) * 0.5, cos(time * 0.4) * 0.5, 1.0));
      vec3 lightDir2 = normalize(vec3(cos(time * 0.3) * 0.5, sin(time * 0.6) * 0.5, 1.0));
      
      // Calculate specular highlights
      vec3 specular1 = calculateSpecular(normal, viewDir, lightDir1, vec3(1.0, 0.8, 0.6), 32.0); // Warm light
      vec3 specular2 = calculateSpecular(normal, viewDir, lightDir2, vec3(0.6, 0.8, 1.0), 16.0); // Cool light
      
      // Apply color and noise with specular reflections
      vec3 finalColor = mix(gradientColor, c3, combinedNoise * 0.5);
      finalColor += specular1 * 0.3 + specular2 * 0.3;
      
      // Create dynamic particles
      float particles = 0.0;
      
      // First particle layer (small and numerous)
      for (int i = 0; i < 5; i++) {
        float t = time * (0.2 + float(i) * 0.02); // Different speeds
        float density = 20.0 + float(i) * 10.0; // Different densities
        vec2 gridPos = fract(uv * density + vec2(t * (0.5 + float(i) * 0.1), cos(t) * 0.2));
        float dist = length(gridPos - 0.5);
        float particle = smoothstep(0.05, 0.0, dist) * 0.5;
        
        // Make some particles brighter based on noise
        float brightness = snoise(vec2(float(i) * 10.0, time * 0.1)) * 0.5 + 0.5;
        particles += particle * brightness;
      }
      
      // Second particle layer (larger and more scattered)
      for (int i = 0; i < 3; i++) {
        float t = time * (0.1 + float(i) * 0.03); // Slower, different speeds
        vec2 gridPos = fract(uv * (10.0 - float(i) * 2.0) + vec2(sin(t) * 0.1, t));
        float dist = length(gridPos - 0.5);
        
        // Larger particles with soft edges
        float particle = smoothstep(0.15, 0.02, dist) * 0.7;
        
        // Add "twinkling" effect
        float twinkle = sin(time * (3.0 + float(i))) * 0.5 + 0.5;
        particles += particle * twinkle;
      }
      
      // Add particles with color variation
      finalColor += particles * mix(c1, c3, uv.y);
      
      // Add pulsing glow effect
      float pulse = (sin(time) * 0.5 + 0.5) * 0.2;
      finalColor += c1 * pulse * (1.0 - length(uv - 0.5)) * 2.0;
      
      // Enhanced vignette effect
      float vignette = 1.0 - dot((uv - 0.5) * 1.3, (uv - 0.5) * 1.3);
      vignette = pow(vignette, 1.7);
      finalColor *= vignette;
      
      // Add subtle fog/atmospheric effect
      finalColor = mix(finalColor, mix(color2, c3, 0.5) * 0.5, 1.0 - vignette * 0.8);
      
      // Enhance contrast
      finalColor = pow(finalColor, vec3(0.95));
      
      // Calculate distance from center for edge fading
      float distFromCenter = length(uv - 0.5) * 2.0; // 0 at center, ~1.0 at corners
      
      // Create an extremely soft and wide fade out effect at the edges
      float edgeFade = smoothstep(0.4, 1.8, distFromCenter);
      
      // Apply a radial gradient to further soften the edges
      float radialGradient = 1.0 - smoothstep(0.0, 1.5, distFromCenter);
      
      // Apply the fade out to the alpha channel with improved smoothness
      float alpha = pow(1.0 - edgeFade, 1.4) * radialGradient; // Enhanced falloff
      
      // Apply alpha and output final color
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3.0, 3.0]} /> {/* Much larger to allow for extended fade out */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false} /* Prevents z-fighting with background elements */
        blending={THREE.AdditiveBlending} /* Enhances glow effect at edges */
      />
    </mesh>
  );
};

export default AbstractBackground;