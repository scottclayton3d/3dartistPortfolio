import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import FloatingParticles from './FloatingParticles';

interface ThreeSceneProps {
  children?: React.ReactNode;
  orbitControls?: boolean;
  backgroundColor?: string;
  ambientLightIntensity?: number;
  cameraPosition?: [number, number, number];
}

// Scene setup component to manage effects that need access to the scene
const SceneSetup = ({ backgroundColor = '#121212' }: { backgroundColor?: string }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    if (backgroundColor) {
      scene.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor, scene]);
  
  return null;
};

// AnimatedCamera component to add subtle camera movement
const AnimatedCamera = ({ position = [0, 0, 5] }: { position?: [number, number, number] }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { animationEnabled } = usePortfolio();
  
  useFrame(({ clock }) => {
    if (!cameraRef.current || !animationEnabled) return;
    
    // Add subtle floating movement to camera
    const t = clock.getElapsedTime();
    const camera = cameraRef.current;
    
    camera.position.x = position[0] + Math.sin(t * 0.2) * 0.2;
    camera.position.y = position[1] + Math.cos(t * 0.1) * 0.1;
  });
  
  return (
    <PerspectiveCamera 
      ref={cameraRef} 
      makeDefault 
      position={position} 
      fov={50}
    />
  );
};

const ThreeScene: React.FC<ThreeSceneProps> = ({
  children,
  orbitControls = true,
  backgroundColor = '#121212',
  ambientLightIntensity = 0.5,
  cameraPosition = [0, 0, 5]
}) => {
  const [isGLAvailable, setIsGLAvailable] = useState(true);
  
  // Check if WebGL is available
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const isWebGLSupported = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setIsGLAvailable(isWebGLSupported);
    } catch (e) {
      setIsGLAvailable(false);
    }
  }, []);
  
  // Fallback if WebGL is not available
  if (!isGLAvailable) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary">
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-secondary mb-4">
            WebGL Not Available
          </h3>
          <p className="text-muted-foreground">
            Your browser or device doesn't support WebGL, which is required to view 3D content.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Canvas
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: 'default',
        stencil: false,
        depth: true
      }}
      dpr={[1, 2]} // Responsive pixel ratio
      style={{ width: '100%', height: '100%' }}
      shadows
    >
      {/* Camera */}
      <AnimatedCamera position={cameraPosition} />
      
      {/* Scene Setup */}
      <SceneSetup backgroundColor={backgroundColor} />
      
      {/* Lighting Setup */}
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      <hemisphereLight intensity={0.4} groundColor="#121212" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      {/* Floating Particles Background */}
      <FloatingParticles count={300} radius={10} />
      
      {/* Scene Content */}
      {children}
      
      {/* Controls */}
      {orbitControls && (
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enableDamping
        />
      )}
    </Canvas>
  );
};

export default ThreeScene;
