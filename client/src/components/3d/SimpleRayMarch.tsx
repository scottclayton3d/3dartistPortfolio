import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';

const SimpleRayMarch = ({
  colorPalette = ['#ff3366', '#121212', '#00ffd1'],
  intensity = 1.0
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
    mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
    intensity: { value: intensity },
    aspect: { value: size.width / size.height }
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
      materialRef.current.uniforms.aspect.value = size.width / size.height;
    }
  }, [size]);
  
  // Vertex shader - standard pass-through
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  // Simplified ray marching fragment shader that will work reliably
  const fragmentShader = `
    precision highp float;
    
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mousePosition;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float intensity;
    uniform float aspect;
    
    varying vec2 vUv;
    
    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.01
    
    // Noise function
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = i.x + i.y * 57.0 + i.z * 113.0;
      float a = hash(n);
      float b = hash(n + 1.0);
      float c = hash(n + 57.0);
      float d = hash(n + 58.0);
      float e = hash(n + 113.0);
      float f1 = hash(n + 114.0);
      float g = hash(n + 170.0);
      float h = hash(n + 171.0);
      
      float res = mix(
        mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
        mix(mix(e, f1, f.x), mix(g, h, f.x), f.y),
        f.z
      );
      return res;
    }
    
    // Distance functions
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
    
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    
    // Scene description
    float map(vec3 p) {
      // Animated position
      vec3 q = p;
      q.x += sin(time * 0.5 + q.z * 0.5) * 0.5;
      q.y += cos(time * 0.3 + q.x * 0.5) * 0.5;
      
      // Base sphere shape
      float sphere = sdSphere(q, 1.2);
      
      // Add noise displacement
      float disp = noise(q * 3.0 + time * 0.3) * 0.3;
      sphere -= disp;
      
      // Mouse interaction
      vec3 mousePos = vec3((mousePosition.x * 2.0 - 1.0) * aspect * 3.0, 
                           (mousePosition.y * 2.0 - 1.0) * 3.0, 0.0);
      float mouseSphere = sdSphere(p - mousePos, 0.8);
      
      // Blend shapes
      float final = smin(sphere, mouseSphere, 1.0);
      
      // Small decorative spheres
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec3 pos = vec3(
          sin(time * 0.3 + fi * 1.3) * 2.0,
          cos(time * 0.4 + fi * 1.1) * 2.0,
          sin(time * 0.5 + fi * 0.9) * 2.0
        );
        float size = 0.2 + sin(time * 0.6 + fi) * 0.1;
        float smallSphere = sdSphere(q - pos, size);
        final = smin(final, smallSphere, 0.5);
      }
      
      return final;
    }
    
    // Calculate normal
    vec3 calcNormal(vec3 p) {
      float eps = 0.001;
      vec2 e = vec2(eps, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }
    
    // Ray marching
    float rayMarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      
      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        dO += dS;
        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }
      
      return dO;
    }
    
    void main() {
      // Screen setup
      vec2 uv = vUv;
      vec2 p = (2.0 * uv - 1.0);
      p.x *= aspect;
      
      // Camera setup
      vec3 ro = vec3(0.0, 0.0, 5.0); // Ray origin
      vec3 rd = normalize(vec3(p, -1.5)); // Ray direction
      
      // Ray rotation
      float angle = time * 0.2;
      mat3 rot = mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
      );
      ro = rot * ro;
      rd = rot * rd;
      
      // Ray marching
      float d = rayMarch(ro, rd);
      
      // Output color
      vec3 col = vec3(0.0);
      
      if (d < MAX_DIST) {
        // Get hit position and normal
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);
        
        // Base material color
        vec3 baseColor = mix(color1, color3, noise(p * 2.0 + time * 0.2) * 0.5 + 0.5);
        
        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(n, lightDir), 0.0);
        
        // Specular
        vec3 reflDir = reflect(rd, n);
        float spec = pow(max(dot(reflDir, lightDir), 0.0), 10.0);
        
        // Combine lighting
        col = baseColor * 0.2; // Ambient
        col += baseColor * diff * 0.7; // Diffuse
        col += vec3(1.0) * spec * 0.5; // Specular
        
        // Fresnel (edge glow)
        float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 4.0);
        col += color1 * fresnel * 0.5;
        
        // Fog
        float fogAmount = 1.0 - exp(-d * 0.15);
        vec3 fogColor = mix(color2, color3, 0.5) * 0.1;
        col = mix(col, fogColor, fogAmount * 0.6);
      } else {
        // Background
        float bgPattern = noise(vec3(uv * 8.0, time * 0.1)) * 0.5 + 0.5;
        col = mix(color2 * 0.1, color3 * 0.1, bgPattern);
        
        // Background vignette
        float vignette = length(p * 0.5) * 1.3;
        vignette = smoothstep(0.0, 1.5, vignette);
        col = mix(col, vec3(0.0), vignette);
      }
      
      // Add particle effects
      for (int i = 0; i < 8; i++) {
        float fi = float(i);
        vec2 pos = vec2(
          sin(time * 0.3 + fi * 1.7) * 0.5 + 0.5,
          cos(time * 0.4 + fi * 1.3) * 0.5 + 0.5
        );
        
        float d = length(uv - pos);
        float size = 0.003 + sin(time + fi) * 0.002;
        float brightness = 0.05 / (d * 200.0 * size);
        
        // Particle color
        vec3 particleCol = mix(color1, color3, sin(fi + time) * 0.5 + 0.5);
        col += particleCol * brightness;
      }
      
      // Color adjustments
      col = col * intensity;
      col = pow(col, vec3(0.4545)); // Gamma correction
      
      // Calculate alpha for transparent background
      float contentBrightness = max(max(col.r, col.g), col.b);
      float alpha = smoothstep(0.02, 0.05, contentBrightness);
      
      // Edge fade
      float edgeDist = length(p * 0.5);
      float edgeFade = 1.0 - smoothstep(0.8, 1.3, edgeDist);
      alpha *= edgeFade;
      
      gl_FragColor = vec4(col, alpha);
    }
  `;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3.0, 3.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default SimpleRayMarch;