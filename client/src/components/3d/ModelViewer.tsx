import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ModelViewerProps } from '@/types';
import { isMobileDevice } from '@/lib/helpers';

// Simple model component
function Model({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  // Create a clone of the scene to prevent sharing issues
  const clonedScene = scene.clone();
  
  return <primitive object={clonedScene} />;
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
          {/* Use manual lighting setup instead of Stage */}
          <group>
            <ambientLight intensity={lightIntensity} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.2} />
            
            {/* Use PresentationControls for better user interaction */}
            <PresentationControls
              rotation={[0, -Math.PI / 4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
              config={{ mass: 2, tension: 400 }}
              snap={{ mass: 4, tension: 200 }}
              speed={1.5}
              zoom={1}
              enabled={interactive}
            >
              <Model modelUrl={modelUrl} />
            </PresentationControls>
          </Stage>
          
          {/* Add orbit controls if interactive */}
          {interactive && !isMobile && (
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={8}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
            />
          )}
          
          {/* Add base lighting */}
          <ambientLight intensity={0.5} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ModelViewer;
