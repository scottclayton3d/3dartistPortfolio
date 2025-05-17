import { useRef } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import * as THREE from 'three';

interface PostProcessingProps {
  enableBloom?: boolean;
  enableChroma?: boolean;
  enableVignette?: boolean;
  enableDOF?: boolean;
  intensity?: number;
  preset?: 'subtle' | 'medium' | 'intense' | 'custom';
}

const PostProcessing: React.FC<PostProcessingProps> = ({
  enableBloom = true,
  enableChroma = false,
  enableVignette = true,
  enableDOF = false,
  intensity = 1,
  preset = 'subtle'
}) => {
  const composerRef = useRef(null);
  const { animationEnabled } = usePortfolio();
  
  // Skip effects if animations are disabled for performance reasons
  if (!animationEnabled) return null;
  
  // Configure effect parameters based on preset
  let bloomIntensity = 0.15;
  let bloomLuminanceThreshold = 0.5;
  let vignetteIntensity = 0.3;
  
  // Apply preset configurations
  switch (preset) {
    case 'medium':
      bloomIntensity = 0.3;
      bloomLuminanceThreshold = 0.4;
      vignetteIntensity = 0.4;
      break;
    case 'intense':
      bloomIntensity = 0.5;
      bloomLuminanceThreshold = 0.3;
      vignetteIntensity = 0.5;
      break;
    case 'custom':
      // Use the provided values
      bloomIntensity = 0.15 * intensity;
      bloomLuminanceThreshold = 0.6 - (intensity * 0.1);
      vignetteIntensity = 0.3 * intensity;
      break;
  }
  
  // Create an array of effects to render
  const effectElements: JSX.Element[] = [];
  
  if (enableBloom) {
    effectElements.push(
      <Bloom 
        key="bloom"
        intensity={bloomIntensity}
        luminanceThreshold={bloomLuminanceThreshold}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
      />
    );
  }
  
  if (enableVignette) {
    effectElements.push(
      <Vignette
        key="vignette"
        offset={0.3}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />
    );
  }
  
  // Only render EffectComposer if there are effects to display
  return effectElements.length > 0 ? (
    <EffectComposer>{effectElements}</EffectComposer>
  ) : null;
};

export default PostProcessing;