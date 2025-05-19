import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface MatrixEffectProps {
  color?: string;
  fontSize?: number;
  density?: number;
  speed?: number;
}

const MatrixEffect: React.FC<MatrixEffectProps> = ({
  color = '#00ff66',
  fontSize = 16,
  density = 0.1,
  speed = 1
}) => {
  const { animationEnabled } = usePortfolio();
  const pointsRef = useRef<THREE.Points>(null);
  const charsRef = useRef<string[]>([]);
  const fallSpeedsRef = useRef<number[]>([]);

  // Generate characters for matrix effect
  useEffect(() => {
    // Kanji and other characters
    const chars = Array.from({ length: 100 }, (_, i) => 
      String.fromCharCode(0x30A0 + Math.random() * 96)
    );
    charsRef.current = chars;

    // Initialize fall speeds
    fallSpeedsRef.current = Array.from({ length: chars.length }, () => 
      (Math.random() * 0.5 + 0.5) * speed
    );
  }, [speed]);

  // Create particles
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(charsRef.current.length * 3);
    const colors = new Float32Array(charsRef.current.length * 3);
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < charsRef.current.length; i++) {
      // Random position in a column formation
      positions[i * 3] = (Math.random() - 0.5) * 20;     // x
      positions[i * 3 + 1] = Math.random() * 20 - 10;    // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

      // Slightly varied colors
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    return { positions, colors };
  }, [color]);

  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current || !animationEnabled) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      // Update y position (falling effect)
      positions[i + 1] -= fallSpeedsRef.current[i / 3] * delta * 5;

      // Reset when particle reaches bottom
      if (positions[i + 1] < -10) {
        positions[i + 1] = 10;
        positions[i] = (Math.random() - 0.5) * 20;     // Randomize x
        positions[i + 2] = (Math.random() - 0.5) * 20; // Randomize z
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={fontSize * 0.01}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default MatrixEffect;