import { useMemo } from 'react';
import * as THREE from 'three';
import CustomShader from './CustomShader';

interface SkyShaderProps {
  sunPosition?: [number, number, number];
  atmosphereColor?: string;
  cloudDensity?: number;
  timeScale?: number;
}

/**
 * A specialized shader for creating atmospheric sky effects
 * with dynamic clouds, sun position, and daytime cycle
 */
const SkyShader: React.FC<SkyShaderProps> = ({
  sunPosition = [0, 1, 0],
  atmosphereColor = '#1e90ff',
  cloudDensity = 0.5,
  timeScale = 1.0
}) => {
  
  // Sky vertex shader
  const skyVertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    uniform vec3 uSunPosition;
    
    void main() {
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vSunDirection = normalize(uSunPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  // Sky fragment shader with advanced atmospheric effects
  const skyFragmentShader = `
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    
    uniform vec3 uAtmosphereColor;
    uniform float uTime;
    uniform float uCloudDensity;
    uniform float uTimeScale;
    
    // Hash function
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }
    
    // Noise function
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      float n00 = hash(dot(i, vec2(127.1, 311.7)));
      float n01 = hash(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7)));
      float n10 = hash(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7)));
      float n11 = hash(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7)));
      
      float nx0 = mix(n00, n10, u.x);
      float nx1 = mix(n01, n11, u.x);
      
      return mix(nx0, nx1, u.y);
    }
    
    // Fractional Brownian Motion for clouds
    float fbm(vec2 p) {
      float f = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 5; i++) {
        f += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return f;
    }
    
    // Calculate sky color based on height and sun direction
    vec3 getSkyColor(vec3 worldPos, vec3 sunDir) {
      // Normalize direction from camera to vertex
      vec3 viewDir = normalize(worldPos);
      
      // Sky gradient based on height
      float y = viewDir.y;
      
      // Base sky colors - use atmosphere color as base
      vec3 skyColorTop = vec3(0.1, 0.3, 0.6) * uAtmosphereColor;
      vec3 skyColorHorizon = vec3(0.6, 0.8, 0.95) * uAtmosphereColor;
      
      // Apply different blending near horizon for more realistic look
      float horizonMix = smoothstep(-0.07, 0.25, y);
      vec3 skyColor = mix(skyColorHorizon, skyColorTop, horizonMix);
      
      // Sun effect - dot product of view direction and sun direction
      float sunEffect = max(0.0, dot(viewDir, sunDir));
      
      // Core sun (small bright spot)
      float sunCore = pow(sunEffect, 256.0);
      
      // Sun glow (larger diffuse area)
      float sunGlow = pow(sunEffect, 64.0) * 0.25;
      
      // Outer sun atmosphere
      float sunAtmosphere = pow(sunEffect, 16.0) * 0.2;
      
      // Combine sun effects
      vec3 sunColor = vec3(1.0, 0.9, 0.6); // Warm sun color
      skyColor += sunColor * sunCore * 2.0;
      skyColor += sunColor * sunGlow;
      skyColor += vec3(1.0, 0.6, 0.3) * sunAtmosphere;
      
      // Add clouds - only in upper hemisphere
      if (y > 0.0) {
        // Animated cloud movement
        float timeOffset = uTime * 0.01 * uTimeScale;
        
        // Create base cloud layer
        vec2 cloudCoord = worldPos.xz * 0.01 + vec2(timeOffset, timeOffset * 0.5);
        float clouds = fbm(cloudCoord);
        
        // Add detail layer
        clouds += fbm(cloudCoord * 2.0 + vec2(timeOffset * -0.3, timeOffset * 0.2)) * 0.5;
        
        // Adjust cloud density and sharpness
        clouds = smoothstep(0.45, 0.55, clouds * uCloudDensity);
        
        // Fade clouds at horizon and zenith
        float cloudMask = y * (1.0 - y * 0.8); // Maximize at mid-height
        clouds *= cloudMask * 1.5;
        
        // Sun through clouds effect
        float sunThroughClouds = pow(sunEffect, 4.0) * 0.5;
        vec3 cloudColor = mix(
          vec3(0.9, 0.9, 0.95), // Default cloud color
          vec3(1.0, 0.8, 0.4),  // Sunset-tinted cloud color
          sunThroughClouds
        );
        
        // Apply clouds with sun lighting
        skyColor = mix(skyColor, cloudColor, clouds);
      }
      
      return skyColor;
    }
    
    void main() {
      vec3 skyColor = getSkyColor(vWorldPosition, vSunDirection);
      
      // HDR tone-mapping and gamma correction
      skyColor = skyColor / (skyColor + vec3(1.0));
      skyColor = pow(skyColor, vec3(1.0 / 2.2));
      
      gl_FragColor = vec4(skyColor, 1.0);
    }
  `;
  
  // Convert position and color to Three.js types
  const sunPos = useMemo(() => new THREE.Vector3(...sunPosition), [sunPosition]);
  const atmColor = useMemo(() => new THREE.Color(atmosphereColor), [atmosphereColor]);
  
  // Define shader uniforms
  const shaderUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunPosition: { value: sunPos },
    uAtmosphereColor: { value: atmColor },
    uCloudDensity: { value: cloudDensity },
    uTimeScale: { value: timeScale }
  }), [sunPos, atmColor, cloudDensity, timeScale]);
  
  return (
    <CustomShader
      vertexShader={skyVertexShader}
      fragmentShader={skyFragmentShader}
      uniforms={shaderUniforms}
      side={THREE.BackSide}
    />
  );
};

export default SkyShader;