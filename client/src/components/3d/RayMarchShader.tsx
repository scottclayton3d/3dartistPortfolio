import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

const RayMarchShader = ({
  colorPalette = ['#ff3366', '#101010', '#00ffd1'],
  preset = "neon"
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mousePosition = useMousePosition();
  
  // Visual presets from provided code
  const presets = {
    moody: {
      sphereCount: 6,
      bloomStrength: 0.3,
      bloomThreshold: 0.2,
      bloomRadius: 0.5,
      ambientIntensity: 0.05,
      diffuseIntensity: 0.4,
      specularIntensity: 2,
      specularPower: 8,
      fresnelPower: 1.0,
      backgroundColor: new THREE.Color(0x050505),
      sphereColor: new THREE.Color(0x000000),
      lightColor: new THREE.Color(0xffffff),
      lightPosition: new THREE.Vector3(1, 1, 1),
      smoothness: 0.3,
      contrast: 1.2,
      fogDensity: 0.15,
      movementPattern: "orbital",
      movementSpeed: 1.0,
      movementScale: 1.0,
      individualRotation: true
    },
    cosmic: {
      sphereCount: 8,
      bloomStrength: 0.8,
      bloomThreshold: 0.1,
      bloomRadius: 0.7,
      ambientIntensity: 0.1,
      diffuseIntensity: 0.5,
      specularIntensity: 1.2,
      specularPower: 16,
      fresnelPower: 2.0,
      backgroundColor: new THREE.Color(0x000011),
      sphereColor: new THREE.Color(0x000022),
      lightColor: new THREE.Color(0x88aaff),
      lightPosition: new THREE.Vector3(0.5, 1, 0.5),
      smoothness: 0.4,
      contrast: 1.4,
      fogDensity: 0.2,
      movementPattern: "wave",
      movementSpeed: 1.2,
      movementScale: 1.3,
      individualRotation: true
    },
    neon: {
      sphereCount: 7,
      bloomStrength: 1.5,
      bloomThreshold: 0.05,
      bloomRadius: 0.9,
      ambientIntensity: 0.12,
      diffuseIntensity: 0.7,
      specularIntensity: 1.8,
      specularPower: 20,
      fresnelPower: 2.2,
      backgroundColor: new THREE.Color(0x000505),
      sphereColor: new THREE.Color(0x000808),
      lightColor: new THREE.Color(0x00ffcc),
      lightPosition: new THREE.Vector3(0.7, 1.3, 0.8),
      smoothness: 0.45,
      contrast: 1.6,
      fogDensity: 0.08,
      movementPattern: "wave",
      movementSpeed: 1.4,
      movementScale: 1.1,
      individualRotation: true
    },
    vibrant: {
      sphereCount: 10,
      bloomStrength: 1.0,
      bloomThreshold: 0.1,
      bloomRadius: 0.8,
      ambientIntensity: 0.15,
      diffuseIntensity: 0.6,
      specularIntensity: 1.0,
      specularPower: 24,
      fresnelPower: 2.5,
      backgroundColor: new THREE.Color(0x0a0505),
      sphereColor: new THREE.Color(0x110000),
      lightColor: new THREE.Color(0xff8866),
      lightPosition: new THREE.Vector3(0.8, 1.2, 0.6),
      smoothness: 0.5,
      contrast: 1.5,
      fogDensity: 0.05,
      movementPattern: "chaos",
      movementSpeed: 1.5,
      movementScale: 1.2,
      individualRotation: true
    }
  };
  
  // Get current preset with type safety
  const currentPreset = presets[preset as keyof typeof presets] || presets.neon;
  
  // Set the primary and accent colors based on colorPalette
  const primaryColor = new THREE.Color(colorPalette[0]);
  const bgColor = new THREE.Color(colorPalette[1]);
  const accentColor = new THREE.Color(colorPalette[2]);
  
  // Override preset colors with provided palette
  currentPreset.lightColor = accentColor;
  currentPreset.backgroundColor = bgColor;
  
  // Animation parameters
  const params = {
    ...currentPreset,
    animationSpeed: 1.0,
    cameraDistance: 2.0,
    mouseProximityEffect: true,
    minMovementScale: 0.3,
    maxMovementScale: 1.0,
    mouseSmoothness: 0.1
  };
  
  // Create shader uniforms
  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uSphereCount: { value: params.sphereCount },
    uAmbientIntensity: { value: params.ambientIntensity },
    uDiffuseIntensity: { value: params.diffuseIntensity },
    uSpecularIntensity: { value: params.specularIntensity },
    uSpecularPower: { value: params.specularPower },
    uFresnelPower: { value: params.fresnelPower },
    uBackgroundColor: { value: params.backgroundColor },
    uSphereColor: { value: params.sphereColor },
    uLightColor: { value: params.lightColor },
    uLightPosition: { value: params.lightPosition },
    uSmoothness: { value: params.smoothness },
    uContrast: { value: params.contrast },
    uFogDensity: { value: params.fogDensity },
    uAnimationSpeed: { value: params.animationSpeed },
    uCameraDistance: { value: params.cameraDistance },
    uMovementPattern: {
      value: ["orbital", "wave", "chaos", "pulse"].indexOf(
        params.movementPattern
      )
    },
    uMovementSpeed: { value: params.movementSpeed },
    uMovementScale: { value: params.movementScale },
    uIndividualRotation: { value: params.individualRotation ? 1.0 : 0.0 },
    uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseProximityEffect: { value: params.mouseProximityEffect ? 1.0 : 0.0 },
    uMinMovementScale: { value: params.minMovementScale },
    uMaxMovementScale: { value: params.maxMovementScale }
  });
  
  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Enhanced mouse interpolation with more responsive interaction
      const currentMouseX = materialRef.current.uniforms.uMousePosition.value.x;
      const currentMouseY = materialRef.current.uniforms.uMousePosition.value.y;
      
      // Scale up the mouse influence for stronger effect
      const targetX = mousePosition.relativeX * 0.5 + 0.5;
      const targetY = mousePosition.relativeY * 0.5 + 0.5;
      
      // More responsive mouse tracking (faster response)
      const mouseSmoothness = 0.15; // Increased from default for faster response
      
      materialRef.current.uniforms.uMousePosition.value.x += 
        (targetX - currentMouseX) * mouseSmoothness;
      materialRef.current.uniforms.uMousePosition.value.y += 
        (targetY - currentMouseY) * mouseSmoothness;
        
      // Modify other parameters based on mouse position for more dynamic effect
      // Adjust movement scale based on mouse position (center = slower, edges = faster)
      const distanceFromCenter = Math.sqrt(
        Math.pow(mousePosition.relativeX, 2) + 
        Math.pow(mousePosition.relativeY, 2)
      );
      
      // Map distance to movement scale (more movement at edges, less in center)
      const dynamicScale = params.minMovementScale + 
        (params.maxMovementScale - params.minMovementScale) * 
        Math.min(1.0, distanceFromCenter * 1.2);
        
      materialRef.current.uniforms.uMovementScale.value = dynamicScale;
    }
  });
  
  // Update resolution uniform when window size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
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
  
  // Fragment shader from provided code
  const fragmentShader = `
    precision highp float;
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform int uSphereCount;
    uniform float uAmbientIntensity;
    uniform float uDiffuseIntensity;
    uniform float uSpecularIntensity;
    uniform float uSpecularPower;
    uniform float uFresnelPower;
    uniform vec3 uBackgroundColor;
    uniform vec3 uSphereColor;
    uniform vec3 uLightColor;
    uniform vec3 uLightPosition;
    uniform float uSmoothness;
    uniform float uContrast;
    uniform float uFogDensity;
    uniform float uAnimationSpeed;
    uniform float uCameraDistance;
    uniform int uMovementPattern;
    uniform float uMovementSpeed;
    uniform float uMovementScale;
    uniform float uIndividualRotation;
    uniform vec2 uMousePosition;
    uniform float uMouseProximityEffect;
    uniform float uMinMovementScale;
    uniform float uMaxMovementScale;
    
    varying vec2 vUv;
    
    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.001
    #define PI 3.1415926535897932384626433832795
    
    // Hash function for pseudo-random numbers
    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    
    // Smooth minimum function for blending shapes
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    
    // Sphere SDF
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    // Generate a 3D position based on the movement pattern
    vec3 getPosition(float id, float time) {
      // Base attributes unique to each sphere
      float uniqueOffset = hash(id) * 2.0 * PI;
      float uniqueSpeed = 0.5 + hash(id + 10.0) * 0.5;
      float uniqueScale = 0.7 + hash(id + 20.0) * 0.6;
      float uniqueRadius = 0.6 + hash(id + 30.0) * 0.8;
      
      // Animation time
      float t = time * uMovementSpeed * uniqueSpeed;
      
      // Base position
      vec3 pos = vec3(0.0);
      
      // Apply different movement patterns
      if (uMovementPattern == 0) { // Orbital
        float angle = t + uniqueOffset;
        float radiusXY = uniqueRadius;
        float height = sin(t * 0.5 + uniqueOffset) * 0.3;
        
        pos.x = cos(angle) * radiusXY;
        pos.y = sin(angle) * radiusXY;
        pos.z = height;
      } 
      else if (uMovementPattern == 1) { // Wave
        float waveX = sin(t + uniqueOffset);
        float waveY = cos(t * 0.7 + uniqueOffset);
        float waveZ = sin(t * 0.5 + uniqueOffset * 2.0);
        
        pos.x = waveX * uniqueRadius;
        pos.y = waveY * uniqueRadius;
        pos.z = waveZ * 0.5;
      }
      else if (uMovementPattern == 2) { // Chaos
        float noise1 = sin(t * 1.1 + uniqueOffset) * cos(t * 0.9 + uniqueOffset * 2.0);
        float noise2 = sin(t * 0.8 + uniqueOffset * 3.0) * cos(t * 1.2 + uniqueOffset);
        float noise3 = sin(t * 0.7 + uniqueOffset * 0.5) * cos(t * 0.6 + uniqueOffset * 4.0);
        
        pos.x = noise1 * uniqueRadius;
        pos.y = noise2 * uniqueRadius;
        pos.z = noise3 * 0.6;
      }
      else if (uMovementPattern == 3) { // Pulse
        float pulse = (sin(t) * 0.5 + 0.5) * uniqueRadius;
        float angle = uniqueOffset + (uIndividualRotation > 0.5 ? t : 0.0);
        
        pos.x = cos(angle) * pulse;
        pos.y = sin(angle) * pulse;
        pos.z = cos(t * 0.5 + uniqueOffset) * 0.3;
      }
      
      // Apply mouse influence
      if (uMouseProximityEffect > 0.5) {
        // Convert mouse position to world space
        vec2 mouseWorld = (uMousePosition * 2.0 - 1.0) * 2.0;
        
        // Calculate distance to mouse
        float mouseDistance = length(vec2(pos.x, pos.y) - mouseWorld);
        float mouseInfluence = 1.0 - smoothstep(0.0, 2.0, mouseDistance);
        
        // Apply repulsion force
        vec2 repulsionDir = normalize(vec2(pos.x, pos.y) - mouseWorld);
        pos.x += repulsionDir.x * mouseInfluence * 0.5;
        pos.y += repulsionDir.y * mouseInfluence * 0.5;
        
        // Add some vertical movement based on mouse proximity
        pos.z += mouseInfluence * 0.3 * sin(t * 2.0 + uniqueOffset);
      }
      
      // Apply final scale
      return pos * uMovementScale * uniqueScale;
    }
    
    // Get the distance to the nearest sphere
    float mapSpheres(vec3 p) {
      float time = uTime * uAnimationSpeed;
      
      // Initialize with a large distance
      float d = 100.0;
      
      // Base sphere size
      float baseSize = 0.2;
      
      // Iterate through all spheres
      for (int i = 0; i < 10; i++) {
        if (i >= uSphereCount) break;
        
        float id = float(i);
        
        // Get sphere position
        vec3 spherePos = getPosition(id, time);
        
        // Calculate distance to this sphere
        float sphereSize = baseSize * (0.7 + hash(id + 40.0) * 0.6);
        float sphereDist = sdSphere(p - spherePos, sphereSize);
        
        // Use smooth minimum to blend spheres together
        d = smin(d, sphereDist, uSmoothness);
      }
      
      return d;
    }
    
    // Get the scene distance (combination of all objects)
    float map(vec3 p) {
      return mapSpheres(p);
    }
    
    // Calculate the normal at a point
    vec3 calcNormal(vec3 p) {
      float eps = 0.001;
      vec2 h = vec2(eps, 0.0);
      return normalize(vec3(
        map(p + h.xyy) - map(p - h.xyy),
        map(p + h.yxy) - map(p - h.yxy),
        map(p + h.yyx) - map(p - h.yyx)
      ));
    }
    
    // Ray marching function
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
      // Center and normalize UV coordinates
      vec2 uv = vUv;
      vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
      
      // Setup ray
      vec3 ro = vec3(0.0, 0.0, -uCameraDistance); // Ray origin (camera position)
      vec3 rd = normalize(vec3(p, 1.0)); // Ray direction
      
      // Ray march to find distance
      float d = rayMarch(ro, rd);
      
      // Base color (transparent background)
      vec4 col = vec4(0.0, 0.0, 0.0, 0.0);
      
      // If we hit something
      if (d < MAX_DIST) {
        // Calculate position and normal
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);
        
        // Lighting calculations
        vec3 lightPos = uLightPosition;
        vec3 lightDir = normalize(lightPos - p);
        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, n);
        
        // Base material color (combination of sphere color and position)
        vec3 baseColor = mix(uSphereColor, uLightColor, length(p) * 0.2);
        
        // Ambient light
        vec3 ambient = baseColor * uAmbientIntensity;
        
        // Diffuse light
        float diff = max(dot(n, lightDir), 0.0);
        vec3 diffuse = diff * uLightColor * baseColor * uDiffuseIntensity;
        
        // Specular light
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), uSpecularPower);
        vec3 specular = spec * uLightColor * uSpecularIntensity;
        
        // Fresnel effect (stronger at glancing angles)
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), uFresnelPower);
        vec3 fresnelColor = fresnel * uLightColor;
        
        // Combine lighting components
        vec3 finalColor = ambient + diffuse + specular + fresnelColor;
        
        // Apply contrast adjustment
        finalColor = mix(vec3(0.5), finalColor, uContrast);
        
        // Apply fog based on distance
        float fogFactor = 1.0 - exp(-d * uFogDensity);
        finalColor = mix(finalColor, uBackgroundColor, fogFactor);
        
        // Output color with full opacity where objects are visible
        col = vec4(finalColor, 1.0);
      }
      
      // Extra glow effect for the spheres
      if (d < MAX_DIST) {
        float glow = 1.0 - smoothstep(0.0, 0.2, d - 0.8);
        vec3 glowColor = uLightColor * glow * 0.5;
        col.rgb += glowColor;
      }
      
      // Output final color with alpha
      gl_FragColor = col;
    }
  `;
  
  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms.current}
          transparent={true}
        />
      </mesh>
      <EffectComposer>
        <Bloom 
          intensity={currentPreset.bloomStrength}
          luminanceThreshold={currentPreset.bloomThreshold}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.LARGE}
        />
        <Vignette
          offset={0.5}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
};

export default RayMarchShader;