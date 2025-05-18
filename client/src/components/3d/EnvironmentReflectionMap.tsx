import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { CubeCamera } from '@react-three/drei';

type EnvironmentReflectionMapProps = {
  children: React.ReactNode;
  resolution?: number;
  frames?: number;
  blur?: number;
  hdrPath?: string;
  envMapIntensity?: number;
};

/**
 * Component that creates a dynamic environment map for reflections
 * It can either use a built-in scene reflection or load an HDR environment
 */
const EnvironmentReflectionMap: React.FC<EnvironmentReflectionMapProps> = ({
  children,
  resolution = 256,
  frames = 1,
  blur = 0,
  hdrPath,
  envMapIntensity = 1
}) => {
  const { gl, scene } = useThree();
  const cubeRenderTarget = useRef<THREE.WebGLCubeRenderTarget | null>(null);
  const envMap = useRef<THREE.CubeTexture | null>(null);
  const cubeCameraRef = useRef<THREE.CubeCamera | null>(null);
  
  // If an HDR path is provided, load it using RGBELoader
  useEffect(() => {
    if (hdrPath) {
      // Create a PMREMGenerator to convert HDR to cubemap
      const pmremGenerator = new THREE.PMREMGenerator(gl);
      pmremGenerator.compileEquirectangularShader();
      
      // Load the HDR texture
      new RGBELoader()
        .setDataType(THREE.FloatType)
        .load(hdrPath, (texture) => {
          const envMapTexture = pmremGenerator.fromEquirectangular(texture).texture;
          
          // Apply to scene environment
          scene.environment = envMapTexture;
          
          // Store for use in materials
          envMap.current = envMapTexture;
          
          // Dispose of resources
          texture.dispose();
          pmremGenerator.dispose();
        });
    } else {
      // Create a cube render target for dynamic reflections
      cubeRenderTarget.current = new THREE.WebGLCubeRenderTarget(resolution, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding
      });
      
      // Create a new cube camera
      cubeCameraRef.current = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget.current);
      cubeCameraRef.current.position.set(0, 0, 0);
      scene.add(cubeCameraRef.current);
      
      // Store the cubemap texture for use in materials
      envMap.current = cubeRenderTarget.current.texture;
    }
    
    // Apply envMap to all existing mesh materials in the scene
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => {
            if (material.envMap !== undefined) {
              material.envMap = envMap.current;
              material.envMapIntensity = envMapIntensity;
              material.needsUpdate = true;
            }
          });
        } else if (object.material.envMap !== undefined) {
          object.material.envMap = envMap.current;
          object.material.envMapIntensity = envMapIntensity;
          object.material.needsUpdate = true;
        }
      }
    });
    
    // Clean up
    return () => {
      if (cubeCameraRef.current) {
        scene.remove(cubeCameraRef.current);
      }
      if (cubeRenderTarget.current) {
        cubeRenderTarget.current.dispose();
      }
    };
  }, [gl, scene, resolution, hdrPath, envMapIntensity]);
  
  // Use CubeCamera from drei for dynamic reflections if no HDR path is provided
  if (hdrPath) {
    return <>{children}</>;
  }
  
  return (
    <CubeCamera 
      resolution={resolution} 
      frames={frames} 
      envMap={true}
      blur={blur}
    >
      {(texture) => {
        // Update the reference to the latest texture
        envMap.current = texture;
        
        // Apply the environment map to children
        return React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              envMap: texture,
              envMapIntensity: envMapIntensity
            });
          }
          return child;
        });
      }}
    </CubeCamera>
  );
};

export default EnvironmentReflectionMap;