import { useMemo } from 'react';
import * as THREE from 'three';
import CustomShader from './CustomShader';

interface WaterShaderProps {
  color?: string;
  scale?: number;
  flowSpeed?: number;
  reflectivity?: number;
  transparency?: number;
  waveHeight?: number;
}

/**
 * A specialized shader for creating realistic water effects
 * with waves, reflections, and depth-based transparency
 */
const WaterShader: React.FC<WaterShaderProps> = ({
  color = '#4286f4',
  scale = 1.0,
  flowSpeed = 0.5,
  reflectivity = 0.7,
  transparency = 0.85,
  waveHeight = 0.15
}) => {
  
  // Water vertex shader with procedural wave animation
  const waterVertexShader = `
    uniform float uTime;
    uniform float uScale;
    uniform float uFlowSpeed;
    uniform float uWaveHeight;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Generate multi-layered wave effect for more complexity
      float wave1 = sin(uv.x * 10.0 * uScale + uTime * uFlowSpeed) * 
                   cos(uv.y * 8.0 * uScale + uTime * uFlowSpeed * 0.8) * 0.5;
                   
      float wave2 = sin(uv.x * 20.0 * uScale + uTime * uFlowSpeed * 1.2) * 
                   sin(uv.y * 15.0 * uScale + uTime * uFlowSpeed * 0.6) * 0.25;
                  
      float wave3 = cos(uv.x * 5.0 * uScale - uTime * uFlowSpeed * 0.5) * 
                   sin(uv.y * 12.0 * uScale + uTime * uFlowSpeed * 0.7) * 0.25;
      
      // Combine waves with proper scaling
      float displacement = (wave1 + wave2 + wave3) * uWaveHeight;
      
      // Apply displacement
      vec3 newPosition = position;
      newPosition.y += displacement;
      
      // Calculate new normal based on wave derivatives
      float dx1 = cos(uv.x * 10.0 * uScale + uTime * uFlowSpeed) * 10.0 * uScale;
      float dy1 = -sin(uv.y * 8.0 * uScale + uTime * uFlowSpeed * 0.8) * 8.0 * uScale;
      
      float dx2 = cos(uv.x * 20.0 * uScale + uTime * uFlowSpeed * 1.2) * 20.0 * uScale;
      float dy2 = sin(uv.y * 15.0 * uScale + uTime * uFlowSpeed * 0.6) * 15.0 * uScale;
      
      float dx3 = -sin(uv.x * 5.0 * uScale - uTime * uFlowSpeed * 0.5) * 5.0 * uScale;
      float dy3 = cos(uv.y * 12.0 * uScale + uTime * uFlowSpeed * 0.7) * 12.0 * uScale;
      
      vec3 tangent = normalize(vec3(1.0, (dx1 + dx2 + dx3) * uWaveHeight, 0.0));
      vec3 bitangent = normalize(vec3(0.0, (dy1 + dy2 + dy3) * uWaveHeight, 1.0));
      vNormal = normalize(cross(bitangent, tangent));
      
      // Calculate eye vector for reflections
      vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
      vec4 worldCameraPosition = viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      vEyeVector = normalize(worldPosition.xyz - worldCameraPosition.xyz);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;
  
  // Water fragment shader with advanced lighting and reflections
  const waterFragmentShader = `
    uniform float uTime;
    uniform vec3 uWaterColor;
    uniform float uReflectivity;
    uniform float uTransparency;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    
    // Fresnel approximation
    float fresnel(vec3 eye, vec3 normal) {
      return pow(1.0 - max(0.0, dot(eye, normal)), 5.0);
    }
    
    void main() {
      // Base water color
      vec3 baseColor = uWaterColor;
      
      // Add ripples with varying detail and scale
      float ripples1 = sin(vUv.x * 40.0 + uTime * 0.5) * sin(vUv.y * 40.0 + uTime * 0.3) * 0.05;
      float ripples2 = sin(vUv.x * 20.0 - uTime * 0.2) * sin(vUv.y * 25.0 + uTime * 0.4) * 0.025;
      float ripples = ripples1 + ripples2;
      
      // Generate highlights along wave crests
      float highlights = smoothstep(0.4, 0.6, 
        sin(vUv.x * 30.0 + uTime * 0.4) * 
        sin(vUv.y * 30.0 + uTime * 0.2) * 0.5 + 0.5) * 0.2;
      
      // Lighting effect based on normal
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.2));
      float diffuse = max(0.4, dot(vNormal, lightDir));
      
      // Calculate specular highlight
      vec3 halfwayDir = normalize(lightDir - vEyeVector);
      float specular = pow(max(dot(vNormal, halfwayDir), 0.0), 100.0) * 0.6;
      
      // Calculate fresnel effect for realistic edge highlights
      float fresnelFactor = fresnel(-vEyeVector, vNormal) * uReflectivity;
      
      // Apply all effects
      vec3 finalColor = baseColor * (diffuse + 0.1);
      finalColor = finalColor * (1.0 - ripples * 0.5);  // Darker ripples
      finalColor = mix(finalColor, vec3(1.0), highlights);  // Highlights
      finalColor = mix(finalColor, vec3(0.8, 0.9, 1.0), fresnelFactor);  // Fresnel
      finalColor += vec3(specular);  // Specular highlights
      
      // Depth-based transparency
      float depthFactor = smoothstep(-0.2, 0.8, vPosition.z) * 0.5 + 0.5;
      float opacity = mix(uTransparency * 0.7, uTransparency, depthFactor);
      
      gl_FragColor = vec4(finalColor, opacity);
    }
  `;
  
  // Convert color to THREE.Color
  const waterColor = useMemo(() => new THREE.Color(color), [color]);
  
  // Define shader uniforms
  const shaderUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScale: { value: scale },
    uFlowSpeed: { value: flowSpeed },
    uWaterColor: { value: waterColor },
    uReflectivity: { value: reflectivity },
    uTransparency: { value: transparency },
    uWaveHeight: { value: waveHeight }
  }), [scale, flowSpeed, waterColor, reflectivity, transparency, waveHeight]);
  
  return (
    <CustomShader
      vertexShader={waterVertexShader}
      fragmentShader={waterFragmentShader}
      uniforms={shaderUniforms}
      transparent={true}
    />
  );
};

export default WaterShader;