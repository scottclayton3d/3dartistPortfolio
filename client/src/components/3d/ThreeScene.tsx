import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import PostProcessing from './PostProcessing';

interface ThreeSceneProps {
  children?: React.ReactNode;
  orbitControls?: boolean;
  backgroundColor?: string;
  ambientLightIntensity?: number;
  cameraPosition?: [number, number, number];
  enablePostProcessing?: boolean;
  effectsPreset?: 'subtle' | 'medium' | 'intense' | 'custom';
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

// MatrixEffect Component
const MatrixEffect = ({ color = "#00ff00", fontSize = 16, density = 0.1, speed = 1 }) => {
  const { gl, scene, camera } = useThree();
  const [characters, setCharacters] = useState("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
  const [drops, setDrops] = useState<number[]>([]);

  useEffect(() => {
    const canvas = gl.domElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    const init = () => {
      const columns = Math.floor(canvas.width / fontSize);
      setDrops(Array(columns).fill(0));
    };

    const animate = () => {
      if (!context) return;

      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = color;
      context.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        context.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    init();
    gl.setAnimationLoop(animate);

    return () => {
      gl.setAnimationLoop(null);
    };
  }, [color, fontSize, density, speed, gl, scene, camera, characters, drops]);

  return null;
};

const ThreeScene: React.FC<ThreeSceneProps> = ({
  children,
  orbitControls = true,
  backgroundColor = '#121212',
  ambientLightIntensity = 0.5,
  cameraPosition = [0, 0, 5],
  enablePostProcessing = true,
  effectsPreset = 'subtle'
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

      {/* Scene Content */}
      {children}
      
      {/* Matrix Effect */}
      <MatrixEffect color="#00ff66" fontSize={16} density={0.1} speed={1} />

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

      {/* Post-processing effects */}
      {enablePostProcessing && (
        <PostProcessing 
          enableBloom={true}
          enableChroma={true}
          enableVignette={true}
          preset={effectsPreset}
        />
      )}
    </Canvas>
  );
};

export default ThreeScene;