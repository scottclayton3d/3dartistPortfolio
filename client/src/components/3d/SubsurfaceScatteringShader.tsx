import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Create a custom shader material using drei's shaderMaterial
const SubsurfaceScatteringMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#ff3366'),
    uSubsurfaceColor: new THREE.Color('#f5e0e0'),
    uScatteringRadius: 1.0,
    uIntensity: 0.5,
    uDistortion: 0.3,
    uTranslucency: 0.8,
    uThickness: 0.4,
    uLightPosition: new THREE.Vector3(1, 1, 1),
    uLightColor: new THREE.Color(1, 1, 1),
    uLightIntensity: 1.0,
    uTextureMap: null,
    uNormalMap: null,
    uThicknessMap: null,
    uEnvironmentMap: null,
    uReflectivity: 0.2,
    uRoughness: 0.3,
  },
  // Vertex shader
  `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vViewPosition = -viewPosition.xyz;
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uSubsurfaceColor;
    uniform float uScatteringRadius;
    uniform float uIntensity;
    uniform float uDistortion;
    uniform float uTranslucency;
    uniform float uThickness;
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform float uLightIntensity;
    uniform sampler2D uTextureMap;
    uniform sampler2D uNormalMap;
    uniform sampler2D uThicknessMap;
    uniform samplerCube uEnvironmentMap;
    uniform float uReflectivity;
    uniform float uRoughness;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    // Function to calculate subsurface scattering
    vec3 subsurfaceScattering(vec3 lightDir, vec3 viewDir, vec3 normal, float thickness) {
      // Calculate light penetration depth based on angle
      float lightDot = max(0.0, dot(normal, lightDir));
      float viewDot = max(0.0, dot(normal, viewDir));
      
      // Back-scattering approximation
      float scatteringFactor = exp(-uScatteringRadius * (1.0 - lightDot) / thickness);
      scatteringFactor *= exp(-uScatteringRadius * (1.0 - viewDot) / thickness);
      
      // Add distortion for more realistic effect
      float phaseFunction = (1.0 + uDistortion * (lightDot * viewDot - 1.0));
      
      // Combine factors and apply translucency
      float sss = scatteringFactor * phaseFunction * uTranslucency;
      
      // Mix subsurface color with light color
      return mix(uColor, uSubsurfaceColor, sss) * uLightColor * uIntensity;
    }
    
    // Function to calculate environment reflections
    vec3 getEnvironmentReflection(vec3 normal, vec3 viewDir, float roughness) {
      vec3 reflectDir = reflect(-viewDir, normal);
      float envMipLevel = roughness * 10.0; // Simulate mip mapping for roughness
      vec3 envColor = textureCube(uEnvironmentMap, reflectDir, envMipLevel).rgb;
      return envColor;
    }
    
    void main() {
      // Base color from texture or uniform
      vec3 baseColor = uColor;
      if (uTextureMap != null) {
        baseColor = texture2D(uTextureMap, vUv).rgb;
      }
      
      // Get normal from normal map or use geometry normal
      vec3 normal = vNormal;
      if (uNormalMap != null) {
        // Convert normal map to world space (simplified)
        vec3 tangent = normalize(cross(vNormal, vec3(0.0, 1.0, 0.0)));
        vec3 bitangent = normalize(cross(vNormal, tangent));
        mat3 tbn = mat3(tangent, bitangent, vNormal);
        
        normal = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
        normal = normalize(tbn * normal);
      }
      
      // Get thickness from map or use uniform
      float thickness = uThickness;
      if (uThicknessMap != null) {
        thickness = texture2D(uThicknessMap, vUv).r;
      }
      
      // Calculate light direction
      vec3 lightPos = uLightPosition;
      vec3 lightDir = normalize(lightPos - vPosition);
      
      // View direction
      vec3 viewDir = normalize(vViewPosition);
      
      // Diffuse lighting
      float diffuse = max(0.0, dot(normal, lightDir));
      vec3 diffuseColor = baseColor * diffuse * uLightColor * uLightIntensity;
      
      // Specular lighting
      vec3 halfwayDir = normalize(lightDir + viewDir);
      float specular = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
      vec3 specularColor = uLightColor * specular * 0.2;
      
      // Calculate subsurface scattering
      vec3 subsurfaceColor = subsurfaceScattering(lightDir, viewDir, normal, thickness);
      
      // Environment reflections
      vec3 reflectionColor = vec3(0.0);
      if (uEnvironmentMap != null) {
        reflectionColor = getEnvironmentReflection(normal, viewDir, uRoughness) * uReflectivity;
      }
      
      // Ambient occlusion (simple approximation)
      float ao = 0.2 + 0.8 * max(0.0, dot(normal, vec3(0.0, 1.0, 0.0)));
      
      // Combine all lighting components
      vec3 finalColor = diffuseColor + specularColor + subsurfaceColor + reflectionColor;
      finalColor *= ao;
      
      // Animate subtle color variations over time
      float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
      finalColor += uSubsurfaceColor * pulse * 0.05;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Register the custom material with three.js
extend({ SubsurfaceScatteringMaterial });

// Declare type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      subsurfaceScatteringMaterial: any;
    }
  }
}

interface SubsurfaceScatteringShaderProps {
  color?: string;
  subsurfaceColor?: string;
  scatteringRadius?: number;
  intensity?: number;
  distortion?: number;
  translucency?: number;
  thickness?: number;
  lightPosition?: [number, number, number];
  lightColor?: string;
  lightIntensity?: number;
  textureMap?: THREE.Texture;
  normalMap?: THREE.Texture;
  thicknessMap?: THREE.Texture;
  environmentMap?: THREE.CubeTexture;
  reflectivity?: number;
  roughness?: number;
}

const SubsurfaceScatteringShader: React.FC<SubsurfaceScatteringShaderProps> = ({
  color = '#ff3366',
  subsurfaceColor = '#f5e0e0',
  scatteringRadius = 1.0,
  intensity = 0.5,
  distortion = 0.3,
  translucency = 0.8,
  thickness = 0.4,
  lightPosition = [1, 1, 1],
  lightColor = '#ffffff',
  lightIntensity = 1.0,
  textureMap,
  normalMap,
  thicknessMap,
  environmentMap,
  reflectivity = 0.2,
  roughness = 0.3,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Update time uniform for animations
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });
  
  // Update uniforms when props change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = new THREE.Color(color);
      materialRef.current.uniforms.uSubsurfaceColor.value = new THREE.Color(subsurfaceColor);
      materialRef.current.uniforms.uScatteringRadius.value = scatteringRadius;
      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uDistortion.value = distortion;
      materialRef.current.uniforms.uTranslucency.value = translucency;
      materialRef.current.uniforms.uThickness.value = thickness;
      materialRef.current.uniforms.uLightPosition.value = new THREE.Vector3(...lightPosition);
      materialRef.current.uniforms.uLightColor.value = new THREE.Color(lightColor);
      materialRef.current.uniforms.uLightIntensity.value = lightIntensity;
      materialRef.current.uniforms.uTextureMap.value = textureMap || null;
      materialRef.current.uniforms.uNormalMap.value = normalMap || null;
      materialRef.current.uniforms.uThicknessMap.value = thicknessMap || null;
      materialRef.current.uniforms.uEnvironmentMap.value = environmentMap || null;
      materialRef.current.uniforms.uReflectivity.value = reflectivity;
      materialRef.current.uniforms.uRoughness.value = roughness;
    }
  }, [
    color, subsurfaceColor, scatteringRadius, intensity, distortion,
    translucency, thickness, lightPosition, lightColor, lightIntensity,
    textureMap, normalMap, thicknessMap, environmentMap, reflectivity, roughness
  ]);
  
  return <subsurfaceScatteringMaterial ref={materialRef} />;
};

export default SubsurfaceScatteringShader;