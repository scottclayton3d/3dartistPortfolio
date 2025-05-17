import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { ModelViewerProps } from '@/types';
import { isMobileDevice } from '@/lib/helpers';

// Default geometries if model loading fails
function FallbackModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF3366" />
      </mesh>
      <mesh position={[1.5, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#00FFD1" />
      </mesh>
      <mesh position={[-1.5, 0, 0]}>
        <torusGeometry args={[0.6, 0.2, 16, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

// Simple model component with error handling
function Model({ modelUrl }: { modelUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Try to load the model, handle errors gracefully
  let model;
  try {
    const { scene } = useGLTF(modelUrl);
    model = scene.clone();
  } catch (error) {
    console.warn('Error loading model:', error);
    return <FallbackModel />;
  }
  
  // Simple animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

// Main ModelViewer component with simplified structure
const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl = '/geometries/heart.gltf',
  artworkId,
  interactive = true,
  autoRotate = true,
  backgroundColor = '#121212',
  lightIntensity = 0.7
}) => {
  const isMobile = isMobileDevice();
  
  return (
    <div className="model-viewer-container" id={`model-viewer-${artworkId}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-primary">
          <div className="loading-spinner w-10 h-10"></div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]} // Lower DPR for better performance
          style={{ background: backgroundColor }}
        >
          {/* Basic lighting setup */}
          <ambientLight intensity={lightIntensity} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <directionalLight position={[-10, -10, -5]} intensity={0.2} />
          <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
          
          {/* Center and bound the model to ensure it fits in view */}
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <Model modelUrl={modelUrl} />
            </Center>
          </Bounds>
          
          {/* Controls */}
          {interactive && (
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              minDistance={1.5}
              maxDistance={10}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ModelViewer;