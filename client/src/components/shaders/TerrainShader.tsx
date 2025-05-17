import { useMemo } from 'react';
import * as THREE from 'three';
import CustomShader from './CustomShader';

interface TerrainShaderProps {
  elevation?: number;
  colorMap?: string[];
  wireframe?: boolean;
  noiseScale?: number;
  waterLevel?: number;
  snowLevel?: number;
}

/**
 * A specialized shader for terrain visualization with advanced features
 * like elevation-based coloring, water effects, and dynamic snow
 */
const TerrainShader: React.FC<TerrainShaderProps> = ({
  elevation = 1.0,
  colorMap = ['#2b2816', '#5b5119', '#7e7237', '#9c8b56', '#c4ab7b', '#ebd28b'],
  wireframe = false,
  noiseScale = 0.1,
  waterLevel = 0.05,
  snowLevel = 0.8
}) => {
  
  // Terrain vertex shader with advanced displacement
  const terrainVertexShader = `
    uniform float uTime;
    uniform float uElevation;
    uniform float uNoiseScale;
    
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vNormal;
    
    // Simple noise function
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Calculate elevation based on position
      vElevation = position.y * uElevation;
      
      // Apply small animated displacement for water/wind effect on lower terrain
      float timeScale = uTime * 0.3;
      float noiseValue = 0.0;
      
      // Only apply the effect to areas below a certain height (water)
      if (vElevation < 0.2) {
        vec2 noisePos = position.xz * uNoiseScale + timeScale;
        noiseValue = noise(noisePos) * 0.05 * smoothstep(0.2, -0.2, vElevation);
      }
      
      // Create final position
      vec3 newPosition = position;
      newPosition.y += noiseValue;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;
  
  // Terrain fragment shader with advanced coloring
  const terrainFragmentShader = `
    uniform float uTime;
    uniform vec3 uColorLow;
    uniform vec3 uColorMidLow;
    uniform vec3 uColorMid;
    uniform vec3 uColorMidHigh;
    uniform vec3 uColorHigh;
    uniform vec3 uWaterColor;
    uniform float uWaterLevel;
    uniform float uSnowLevel;
    
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vNormal;
    
    // Function to blend between colors based on height
    vec3 getTerrainColor(float height) {
      // Water level
      if (height < uWaterLevel) {
        // Animated water ripples
        float ripple = sin(vUv.x * 50.0 + uTime * 2.0) * sin(vUv.y * 50.0 + uTime * 2.0) * 0.05;
        float waterLine = smoothstep(-0.05, uWaterLevel, height + ripple);
        return mix(uWaterColor * 0.7, uWaterColor, waterLine);
      }
      
      // Sand/beach - transitional zone
      else if (height < uWaterLevel + 0.1) {
        return mix(uWaterColor, uColorLow, smoothstep(uWaterLevel, uWaterLevel + 0.1, height));
      }
      
      // Low terrain - first color range
      else if (height < 0.3) {
        return mix(uColorLow, uColorMidLow, smoothstep(uWaterLevel + 0.1, 0.3, height));
      }
      
      // Mid-low terrain - second color range
      else if (height < 0.5) {
        return mix(uColorMidLow, uColorMid, smoothstep(0.3, 0.5, height));
      }
      
      // Mid terrain - third color range
      else if (height < 0.7) {
        return mix(uColorMid, uColorMidHigh, smoothstep(0.5, 0.7, height));
      }
      
      // High terrain - fourth color range
      else if (height < uSnowLevel) {
        return mix(uColorMidHigh, uColorHigh, smoothstep(0.7, uSnowLevel, height));
      }
      
      // Mountain peaks - snow
      else {
        // Snow with some rock peeking through
        float noise = fract(sin(vUv.x * 100.0 + vUv.y * 50.0) * 10000.0);
        float snow = smoothstep(uSnowLevel, 0.95, height);
        float rockAmount = noise * 0.3 * (1.0 - snow);
        
        return mix(uColorHigh, vec3(0.95, 0.95, 0.97), snow - rockAmount);
      }
    }
    
    void main() {
      // Basic lighting calculation
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.2));
      float lighting = max(0.4, dot(vNormal, lightDir));
      
      // Add ambient occlusion based on elevation (valleys are darker)
      float ao = smoothstep(-0.2, 0.8, vElevation) * 0.5 + 0.5;
      
      // Get base terrain color from height
      vec3 terrainColor = getTerrainColor(vElevation);
      
      // Apply lighting
      vec3 finalColor = terrainColor * lighting * ao;
      
      // Add atmospheric fog for distant terrain
      float fog = smoothstep(0.0, 0.9, distance(vUv, vec2(0.5)));
      vec3 fogColor = vec3(0.7, 0.8, 0.9);
      finalColor = mix(finalColor, fogColor, fog * 0.3);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  
  // Convert color strings to THREE.Color objects
  const colors = useMemo(() => {
    return colorMap.map(color => new THREE.Color(color));
  }, [colorMap]);
  
  // Define shader uniforms
  const shaderUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uElevation: { value: elevation },
    uNoiseScale: { value: noiseScale },
    uWaterLevel: { value: waterLevel },
    uSnowLevel: { value: snowLevel },
    uColorLow: { value: colors[0] || new THREE.Color('#2b2816') },     // Lowest terrain
    uColorMidLow: { value: colors[1] || new THREE.Color('#5b5119') },  // Low-Mid terrain
    uColorMid: { value: colors[2] || new THREE.Color('#7e7237') },     // Mid terrain
    uColorMidHigh: { value: colors[3] || new THREE.Color('#9c8b56') }, // Mid-High terrain
    uColorHigh: { value: colors[4] || new THREE.Color('#c4ab7b') },    // High terrain
    uWaterColor: { value: new THREE.Color('#1e5799') }                 // Water
  }), [elevation, colors, noiseScale, waterLevel, snowLevel]);
  
  return (
    <CustomShader
      vertexShader={terrainVertexShader}
      fragmentShader={terrainFragmentShader}
      uniforms={shaderUniforms}
      wireframe={wireframe}
    />
  );
};

export default TerrainShader;