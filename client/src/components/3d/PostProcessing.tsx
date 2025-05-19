import { useRef } from 'react';
import { 
  EffectComposer, 
  Bloom, 
  Vignette, 
  ChromaticAberration,
  DepthOfField,
  Noise,
  GodRays,
  SMAA
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resizer } from 'postprocessing';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

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
  preset = 'subtle',
  bloomIntensityOverride,
  bloomThresholdOverride
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
  
  // Get scene info for effects
  const { scene, camera } = useThree();
  
  // Create an array of effects to render
  const effectElements: JSX.Element[] = [];

  // Add anti-aliasing for smoother edges
  effectElements.push(
    <SMAA key="smaa" />
  );
  
  if (enableBloom) {
    effectElements.push(
      <Bloom 
        key="bloom"
        intensity={bloomIntensity}
        luminanceThreshold={bloomLuminanceThreshold}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
    );
  }
  
  // Add chromatic aberration effect (subtle color separation at edges)
  if (enableChroma) {
    effectElements.push(
      <ChromaticAberration
        key="chromatic"
        offset={[0.002, 0.002]}
        radialModulation
        modulationOffset={0.3}
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
  
  // Add subtle noise texture for film grain effect
  effectElements.push(
    <Noise
      key="noise"
      opacity={0.05}
      premultiply
      blendFunction={BlendFunction.SCREEN}
    />
  );
  
  // Add depth of field effect for models when enabled
  if (enableDOF) {
    effectElements.push(
      <DepthOfField
        key="dof"
        focusDistance={0.02}
        focalLength={0.5}
        bokehScale={6}
      />
    );
  }
  
  // Only render EffectComposer if there are effects to display
  return effectElements.length > 0 ? (
    <EffectComposer multisampling={4} stencilBuffer={true}>
      {effectElements}
    </EffectComposer>
  ) : null;
};

export default PostProcessing;