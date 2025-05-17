import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';

// RayMarchVisualizer creates an advanced ray marching effect
// Similar to rayMarcher.js techniques for creating complex 3D shapes from SDFs
const RayMarchVisualizer = ({
  colorPalette = ['#ff3366', '#121212', '#00ffd1'],
  intensity = 1.0
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, camera } = useThree();
  const mousePosition = useMousePosition();
  
  // Create shader uniforms with expanded options for ray marching
  const uniforms = useRef({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(size.width, size.height) },
    color1: { value: new THREE.Color(colorPalette[0]) },
    color2: { value: new THREE.Color(colorPalette[1]) },
    color3: { value: new THREE.Color(colorPalette[2]) },
    mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
    cameraPosition: { value: new THREE.Vector3() },
    cameraTarget: { value: new THREE.Vector3() },
    intensity: { value: intensity },
    aspect: { value: size.width / size.height }
  });
  
  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      // Time progression
      materialRef.current.uniforms.time.value += delta;
      
      // Update mouse position
      materialRef.current.uniforms.mousePosition.value.set(
        mousePosition.relativeX * 0.5 + 0.5,
        mousePosition.relativeY * 0.5 + 0.5
      );
      
      // Update camera info for ray marching
      materialRef.current.uniforms.cameraPosition.value.copy(camera.position);
      
      // Create target that's centered at origin
      const target = new THREE.Vector3(0, 0, 0);
      materialRef.current.uniforms.cameraTarget.value.copy(target);
    }
  });
  
  // Update resolution uniform when window size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
      materialRef.current.uniforms.aspect.value = size.width / size.height;
    }
  }, [size]);
  
  // Ray marching vertex shader - standard pass-through
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  // Ray marching fragment shader - heavily based on raymarching techniques
  const fragmentShader = `
    precision highp float;
    
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mousePosition;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform vec3 cameraPosition;
    uniform vec3 cameraTarget;
    uniform float intensity;
    uniform float aspect;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.001
    #define PI 3.14159265359
    
    // SDF Primitive: Sphere
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    // SDF Primitive: Box
    float sdBox(vec3 p, vec3 b) {
      vec3 d = abs(p) - b;
      return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
    }
    
    // SDF Primitive: Torus
    float sdTorus(vec3 p, vec2 t) {
      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return length(q) - t.y;
    }
    
    // SDF Operation: Smooth union
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    
    // SDF Operation: Repetition
    vec3 opRep(vec3 p, vec3 c) {
      return mod(p + 0.5 * c, c) - 0.5 * c;
    }
    
    // SDF Operation: Twist along Y axis
    vec3 opTwist(vec3 p, float strength) {
      float c = cos(strength * p.y);
      float s = sin(strength * p.y);
      mat2 m = mat2(c, -s, s, c);
      return vec3(m * p.xz, p.y);
    }
    
    // High-quality 3D noise function
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = p.x + p.y * 57.0 + p.z * 113.0;
      float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                      mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                  mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                      mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
      return res;
    }
    
    // Fractal Brownian Motion
    float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      
      for (int i = 0; i < 5; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      
      return v;
    }
    
    // Map function (Signed Distance Function)
    float map(vec3 p) {
      // Time-based animation
      float t = time * 0.3;
      
      // Mouse influence
      vec2 mouseInfl = (mousePosition * 2.0 - 1.0);
      float mouseIntensity = 0.3;
      vec3 mouseMod = vec3(mouseInfl.x, mouseInfl.y, 0.0) * mouseIntensity;
      
      // Create a copy of the position for transformation
      vec3 q = p;
      
      // Apply some global movement
      q.x += sin(time * 0.5) * 0.3;
      q.y += cos(time * 0.4) * 0.2;
      
      // Apply twist based on perlin noise
      float twistAmount = sin(time * 0.2) * 0.5 + 0.5;
      q = opTwist(q, twistAmount * 0.5);
      
      // Create base shape - a morphing sphere
      float morphFactor = sin(time * 0.3) * 0.5 + 0.5;
      float radius = 1.0 + noise(vec3(time * 0.2, 0.0, 0.0)) * 0.2;
      float sphere = sdSphere(q, radius * 0.8);
      
      // Add noise displacement for organic feel
      float dispAmt = 0.2 + morphFactor * 0.1;
      float disp = fbm(q * 2.0 + time * 0.1) * dispAmt;
      sphere -= disp;
      
      // Add some floating objects around the sphere
      vec3 q2 = p;
      q2 = opRep(q2, vec3(4.0 + sin(time * 0.5) * 0.5, 4.0, 4.0));
      float orbitals = sdSphere(q2, 0.3);
      
      // Add a torus that morphs
      vec3 q3 = p;
      q3.y += sin(time * 0.3) * 0.5;
      q3.x += cos(time * 0.3) * 0.5;
      float torusThickness = 0.1 + sin(time * 0.7) * 0.05;
      float torus = sdTorus(q3, vec2(1.5, torusThickness));
      
      // Blend all shapes together
      float d = sphere;
      d = smin(d, orbitals, 0.5 + sin(time * 0.2) * 0.3);
      d = smin(d, torus, 0.8);
      
      // Add mouse interaction
      float mouseSphere = sdSphere(p - vec3(mouseMod.x, mouseMod.y, 0.5), 0.3);
      d = smin(d, mouseSphere, 1.0);
      
      return d * 0.8; // Scale overall size
    }
    
    // Calculate normal
    vec3 calcNormal(vec3 p) {
      const float eps = 0.0001;
      const vec2 h = vec2(eps, 0.0);
      return normalize(vec3(
        map(p + h.xyy) - map(p - h.xyy),
        map(p + h.yxy) - map(p - h.yxy),
        map(p + h.yyx) - map(p - h.yyx)
      ));
    }
    
    // Raymarching
    float raymarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      
      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        dO += dS;
        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }
      
      return dO;
    }
    
    // Soft shadows
    float softshadow(vec3 ro, vec3 rd, float mint, float tmax) {
      float res = 1.0;
      float t = mint;
      
      for (int i = 0; i < 16; i++) {
        float h = map(ro + rd * t);
        res = min(res, 8.0 * h / t);
        t += clamp(h, 0.02, 0.10);
        if (h < 0.001 || t > tmax) break;
      }
      
      return clamp(res, 0.0, 1.0);
    }
    
    // Ambient occlusion
    float ao(vec3 p, vec3 n) {
      float occ = 0.0;
      float sca = 1.0;
      
      for (int i = 0; i < 5; i++) {
        float hr = 0.01 + 0.12 * float(i) / 4.0;
        vec3 aopos = n * hr + p;
        float dd = map(aopos);
        occ += -(dd - hr) * sca;
        sca *= 0.95;
      }
      
      return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
    }
    
    // Main
    void main() {
      // Convert uv to screen coordinates
      vec2 uv = vUv;
      vec2 p = (2.0 * uv - 1.0);
      p.x *= aspect; // Correct for aspect ratio
      
      // Setup camera
      vec3 ro = vec3(0.0, 0.0, 4.0); // Ray origin (camera position)
      vec3 rd = normalize(vec3(p, -1.5)); // Ray direction
      
      // Add camera movement
      float camAngle = time * 0.3;
      mat3 camRotation = mat3(
        cos(camAngle), 0, sin(camAngle),
        0, 1, 0,
        -sin(camAngle), 0, cos(camAngle)
      );
      
      ro = camRotation * ro;
      rd = camRotation * rd;
      
      // Raymarch
      float d = raymarch(ro, rd);
      
      // Initialize color
      vec3 col = vec3(0.0);
      
      // If we hit something
      if (d < MAX_DIST) {
        // Calculate hit position and normal
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);
        
        // Basic lighting parameters
        vec3 lightPos = vec3(4.0, 5.0, -4.0);
        vec3 lightDir = normalize(lightPos - p);
        
        // Calculate lighting components
        float diff = max(dot(n, lightDir), 0.0); // Diffuse
        vec3 h = normalize(lightDir - rd); // Half vector for specular
        float spec = pow(max(dot(n, h), 0.0), 16.0); // Specular
        
        // Shadows and ambient occlusion
        float shadow = softshadow(p, lightDir, 0.02, 2.5);
        float ambOcc = ao(p, n);
        
        // Base material color - blend based on normal and position
        float posNoise = fbm(p * 0.5 + time * 0.1) * 0.5 + 0.5;
        vec3 baseColor = mix(color1, color3, posNoise);
        
        // Specular color
        vec3 specColor = mix(vec3(1.0), color1 * 1.5, 0.5);
        
        // Combine lighting components
        col = baseColor * 0.2; // Ambient
        col += baseColor * diff * shadow * 0.8; // Diffuse
        col += specColor * spec * shadow; // Specular
        
        // Apply ambient occlusion
        col *= ambOcc;
        
        // Add glow/emission based on distance
        float glow = 1.0 / (1.0 + d * d * 0.1);
        col += color3 * glow * 0.2;
        
        // Fog/atmospheric perspective
        float fogAmount = 1.0 - exp(-d * 0.1);
        vec3 fogColor = mix(color2, color3, 0.3);
        col = mix(col, fogColor, fogAmount * 0.7);
      } else {
        // Background - subtle gradient
        float bgPattern = fbm(vec3(uv * 5.0, time * 0.1)) * 0.5 + 0.5;
        vec3 bgCol1 = color2 * 0.2;  // Dark background base
        vec3 bgCol2 = mix(color1, color3, 0.5) * 0.1;  // Subtle accent
        col = mix(bgCol1, bgCol2, bgPattern);
        
        // Vignette
        float vignette = length(uv - 0.5) * 1.5;
        vignette = smoothstep(0.0, 1.5, vignette);
        col = mix(col, vec3(0.0), vignette);
      }
      
      // Dynamic particles - simple glowing dots
      for (int i = 0; i < 5; i++) {
        float t = time * 0.2 + float(i) * 1.2;
        vec2 pos = vec2(
          sin(t * 0.3 + float(i)) * 0.5 + 0.5,
          cos(t * 0.4 + float(i) * 0.9) * 0.5 + 0.5
        );
        
        float dist = length(uv - pos);
        float size = 0.005 + sin(time + float(i) * 2.0) * 0.003;
        float brightness = 0.05 / (dist * 200.0 * size);
        
        // Alternate particle colors
        vec3 particleCol = mix(color1, color3, sin(float(i) + time) * 0.5 + 0.5);
        col += particleCol * brightness;
      }
      
      // Tone mapping and gamma correction
      col = 1.0 - exp(-col * intensity * 1.5); // Exposure
      col = pow(col, vec3(0.4545)); // Gamma
      
      // Calculate alpha based on content
      float contentIntensity = max(max(col.r, col.g), col.b);
      float alpha = smoothstep(0.02, 0.05, contentIntensity);
      
      // Edge fadeout
      float edgeDist = length(p) * 0.5;
      float edgeFade = 1.0 - smoothstep(0.7, 1.2, edgeDist);
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
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default RayMarchVisualizer;