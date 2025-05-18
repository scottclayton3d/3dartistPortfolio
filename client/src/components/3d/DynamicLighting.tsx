import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { SpotLight, PointLight } from '@react-three/drei';
import { useMousePosition } from '@/hooks/useMousePosition';

interface DynamicLightingProps {
  enableMouseFollow?: boolean;
  enablePulsing?: boolean;
  enableColorShift?: boolean;
  lightIntensity?: number;
  pulseSpeed?: number;
  colorPalette?: string[];
  spotLightPosition?: [number, number, number];
  ambientLightIntensity?: number;
}

/**
 * Component that provides dynamic lighting effects including:
 * - Mouse-following spotlights
 * - Pulsing ambient/point lights
 * - Color shifting based on time or interaction
 */
const DynamicLighting: React.FC<DynamicLightingProps> = ({
  enableMouseFollow = true,
  enablePulsing = true,
  enableColorShift = true,
  lightIntensity = 1.0,
  pulseSpeed = 1.0,
  colorPalette = ['#ff3366', '#00ffd1', '#4d54e8', '#f9ca24'],
  spotLightPosition = [10, 10, 10],
  ambientLightIntensity = 0.2
}) => {
  const mousePos = useMousePosition();
  const { viewport, camera } = useThree();
  
  // Refs for animating the lights
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const movingPointLightRef = useRef<THREE.PointLight>(null);
  
  // State for color shifting
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [nextColorIndex, setNextColorIndex] = useState(1);
  const [colorBlend, setColorBlend] = useState(0);
  
  // Calculate world position from mouse position
  const calculateWorldPosition = (mouseX: number, mouseY: number, distance = 5) => {
    // Convert to normalized device coordinates (-1 to +1)
    const x = (mouseX * viewport.width) / 2;
    const y = (mouseY * viewport.height) / 2;
    
    // Create a vector at the near plane
    const vector = new THREE.Vector3(x, y, -distance);
    vector.unproject(camera);
    
    // Create direction vector from camera
    const dir = vector.sub(camera.position).normalize();
    
    // Calculate the position at the given distance
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    return pos;
  };
  
  // Animation loop for lighting effects
  useFrame((_, delta) => {
    // Update mouse-following spotlight
    if (enableMouseFollow && spotLightRef.current) {
      // Calculate target position based on mouse
      const targetPos = calculateWorldPosition(mousePos.relativeX, mousePos.relativeY, 10);
      
      // Smoothly move the spotlight target
      spotLightRef.current.target.position.lerp(targetPos, 0.05);
      spotLightRef.current.target.updateMatrixWorld();
      
      // Add subtle random movement to the spotlight
      spotLightRef.current.position.x = spotLightPosition[0] + Math.sin(Date.now() * 0.001) * 0.5;
      spotLightRef.current.position.z = spotLightPosition[2] + Math.cos(Date.now() * 0.001) * 0.5;
    }
    
    // Pulsing point light
    if (enablePulsing && pointLightRef.current) {
      const pulseValue = Math.sin(Date.now() * 0.001 * pulseSpeed) * 0.5 + 0.5;
      pointLightRef.current.intensity = lightIntensity * 0.5 + pulseValue * lightIntensity * 0.5;
      
      // Also scale the distance based on pulse
      pointLightRef.current.distance = 15 + pulseValue * 5;
    }
    
    // Moving point light
    if (movingPointLightRef.current) {
      const time = Date.now() * 0.001;
      movingPointLightRef.current.position.x = Math.sin(time * 0.5) * 8;
      movingPointLightRef.current.position.y = Math.sin(time * 0.3) * 3 + 3;
      movingPointLightRef.current.position.z = Math.cos(time * 0.5) * 8;
    }
    
    // Color shifting
    if (enableColorShift) {
      // Increase blend factor
      setColorBlend((prev) => {
        const newBlend = prev + delta * 0.2 * pulseSpeed;
        
        // When blend reaches 1, switch to next color
        if (newBlend >= 1) {
          setCurrentColorIndex(nextColorIndex);
          setNextColorIndex((nextColorIndex + 1) % colorPalette.length);
          return 0;
        }
        
        return newBlend;
      });
      
      // Apply color blending
      if (pointLightRef.current) {
        const currentColor = new THREE.Color(colorPalette[currentColorIndex]);
        const nextColor = new THREE.Color(colorPalette[nextColorIndex]);
        pointLightRef.current.color.copy(currentColor).lerp(nextColor, colorBlend);
      }
      
      if (movingPointLightRef.current) {
        const currentColor = new THREE.Color(colorPalette[(currentColorIndex + 2) % colorPalette.length]);
        const nextColor = new THREE.Color(colorPalette[(nextColorIndex + 2) % colorPalette.length]);
        movingPointLightRef.current.color.copy(currentColor).lerp(nextColor, colorBlend);
      }
    }
  });
  
  // Initialize spotlight target
  useEffect(() => {
    if (spotLightRef.current) {
      spotLightRef.current.target.position.set(0, 0, 0);
      spotLightRef.current.target.updateMatrixWorld();
    }
  }, []);
  
  return (
    <>
      {/* Base ambient light */}
      <ambientLight intensity={ambientLightIntensity} />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Interactive spotlight that follows mouse */}
      <SpotLight
        ref={spotLightRef}
        position={spotLightPosition}
        angle={0.3}
        penumbra={0.8}
        intensity={lightIntensity}
        distance={30}
        castShadow
        color={colorPalette[0]}
        attenuation={5}
        anglePower={5}
      />
      
      {/* Pulsing point light */}
      <pointLight
        ref={pointLightRef}
        position={[0, 5, 0]}
        intensity={lightIntensity}
        distance={20}
        color={colorPalette[1]}
        castShadow
      />
      
      {/* Moving point light */}
      <pointLight
        ref={movingPointLightRef}
        position={[0, 3, 0]}
        intensity={lightIntensity * 0.7}
        distance={15}
        color={colorPalette[2]}
        castShadow
      />
    </>
  );
};

export default DynamicLighting;