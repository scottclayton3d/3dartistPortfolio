import { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Html, ContactShadows } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useAudio } from '@/lib/stores/useAudio';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { ModelViewerProps } from '@/types';
import { isMobileDevice } from '@/lib/helpers';

// Model component which handles loading the 3D model
const Model = ({ 
  modelUrl = '/geometries/heart.gltf',
  autoRotate = true,
  interactive = true
}: { 
  modelUrl: string;
  autoRotate?: boolean;
  interactive?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { playHit } = useAudio();
  const { isModelInteractive } = usePortfolio();
  const { scene } = useGLTF(modelUrl);
  
  // Clone the scene to avoid sharing between instances
  const modelScene = useRef(scene.clone());
  
  // Setup spring animation for hover effect
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const { scale, rotation } = useSpring({
    scale: clicked ? 1.2 : hovered ? 1.1 : 1,
    rotation: hovered ? [0, THREE.MathUtils.degToRad(45), 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });
  
  // Handle auto-rotation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (autoRotate && !hovered) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });
  
  // Reset to default position on unmount
  useEffect(() => {
    return () => setClicked(false);
  }, []);
  
  // Handle interactions
  const handleClick = () => {
    if (interactive && isModelInteractive) {
      setClicked(!clicked);
      playHit();
    }
  };
  
  // Only allow hover effects if interactive
  const handlePointerOver = () => {
    if (interactive && isModelInteractive) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };
  
  const handlePointerOut = () => {
    if (interactive && isModelInteractive) {
      setHovered(false);
      document.body.style.cursor = 'auto';
    }
  };
  
  return (
    <animated.group
      ref={groupRef}
      scale={scale}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      dispose={null}
    >
      <primitive object={modelScene.current} />
    </animated.group>
  );
};

// Loading component displayed while model is loading
const ModelLoading = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center">
      <div className="loading-spinner w-8 h-8"></div>
      <span className="text-white text-sm mt-2">Loading Model...</span>
    </div>
  </Html>
);

// Main ModelViewer component
const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl = '/geometries/heart.gltf',
  artworkId,
  interactive = true,
  autoRotate = true,
  backgroundColor = '#121212',
  lightIntensity = 0.5
}) => {
  const isMobile = isMobileDevice();
  
  return (
    <div className="model-viewer-container" id={`model-viewer-${artworkId}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-primary">
          <div className="loading-spinner w-10 h-10"></div>
        </div>
      }>
        <div className="w-full h-full">
          <Suspense fallback={null}>
            <Model
              modelUrl={modelUrl}
              autoRotate={autoRotate}
              interactive={interactive && !isMobile}
            />
            {/* Ground plane with shadow */}
            <ContactShadows 
              opacity={0.4}
              scale={10}
              blur={1}
              far={10}
              resolution={256}
              color="#000000"
              position={[0, -1, 0]}
            />
            {/* Add environment lighting */}
            <Environment preset="studio" />
          </Suspense>
        </div>
      </Suspense>
    </div>
  );
};

export default ModelViewer;
