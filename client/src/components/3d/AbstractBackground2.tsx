import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';

const AbstractBackground = ({ 
  colorPalette = ['#ff3366', '#121212', '#00ffd1'] 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mousePosition = useMousePosition();
  
  // Create shader uniforms
  const uniforms = useRef({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(size.width, size.height) },
    color1: { value: new THREE.Color(colorPalette[0]) },
    color2: { value: new THREE.Color(colorPalette[1]) },
    color3: { value: new THREE.Color(colorPalette[2]) },
    mousePosition: { value: new THREE.Vector2(0.5, 0.5) }
  });
  
  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
      materialRef.current.uniforms.mousePosition.value.set(
        mousePosition.relativeX * 0.5 + 0.5,
        mousePosition.relativeY * 0.5 + 0.5
      );
    }
  });
  
  // Update resolution uniform when window size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
    }
  }, [size]);
  
  // Vertex shader
  function vertexShader() {
    return `
      out vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  // Fragment shader
  function fragmentShader() {
    return `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform int uSphereCount;
      uniform float uAmbientIntensity;
      uniform float uDiffuseIntensity;
      uniform float uSpecularIntensity;
      uniform float uSpecularPower;
      uniform float uFresnelPower;
      uniform vec3 uBackgroundColor;
      uniform vec3 uSphereColor;
      uniform vec3 uLightColor;
      uniform vec3 uLightPosition;
      uniform float uSmoothness;
      uniform float uContrast;
      uniform float uFogDensity;
      uniform float uAnimationSpeed;
      uniform float uCameraDistance;
      uniform int uMovementPattern;
      uniform float uMovementSpeed;
      uniform float uMovementScale;
      uniform bool uIndividualRotation;
      uniform vec2 uMousePosition;
      uniform bool uMouseProximityEffect;
      uniform float uMinMovementScale;
      uniform float uMaxMovementScale;

      in vec2 vUv;
      out vec4 fragColor;

      const float PI = 3.14159265359;
      const float EPSILON = 0.0001;
      const int MAX_STEPS = 100;
      const float MAX_DIST = 100.0;

      // Signed Distance Function for a sphere
      float sdSphere(vec3 p, float r) {
        return length(p) - r;
      }

      // Smooth minimum function for blending
      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * k * 0.25;
      }

      // Rotation matrix around the Y axis
      mat3 rotateY(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
          c, 0, s,
          0, 1, 0,
          -s, 0, c
        );
      }

      // Rotation matrix around the X axis
      mat3 rotateX(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
          1, 0, 0,
          0, c, -s,
          0, s, c
        );
      }

      // Rotation matrix around the Z axis
      mat3 rotateZ(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
          c, -s, 0,
          s, c, 0,
          0, 0, 1
        );
      }

      // Calculate distance to center for mouse proximity effect
      float getDistanceToCenter(vec2 pos) {
        // Use a smoother falloff function
        float dist = length(pos - vec2(0.5, 0.5)) * 2.0; // Normalized 0-1
        // Apply easing curve for smoother transition
        return smoothstep(0.0, 1.0, dist);
      }

      // Scene SDF
      float sdf(vec3 pos) {
        // Base result starts with a large value
        float result = MAX_DIST;

        // Animation parameters
        float t = uTime * uMovementSpeed;

        // Calculate dynamic movement scale based on mouse position if enabled
        float dynamicMovementScale = uMovementScale;
        if (uMouseProximityEffect) {
          float distToCenter = getDistanceToCenter(uMousePosition);
          // Use smoother interpolation between min and max scale
          // Add a bias to make the effect more subtle
          float t = smoothstep(0.0, 1.0, distToCenter);
          dynamicMovementScale = mix(uMinMovementScale, uMaxMovementScale, t);
        }

        // Create spheres based on count
        for (int i = 0; i < 10; i++) {
          if (i >= uSphereCount) break;

          // Unique parameters for each sphere
          float speed = 0.5 + float(i) * 0.1;
          float radius = 0.15 + float(i % 3) * 0.1;
          float orbitRadius = (0.5 + float(i % 5) * 0.2) * dynamicMovementScale;
          float phaseOffset = float(i) * PI * 0.2;

          // Calculate position with unique animation based on pattern
          vec3 offset;

          // Special movement for first two spheres - one going up, one going down
          if (i == 0) {
            // First sphere: bottom to top movement
            offset = vec3(
              sin(t * speed) * orbitRadius * 0.5,
              sin(t * 0.5) * orbitRadius, // Vertical movement
              cos(t * speed * 0.7) * orbitRadius * 0.5
            );
          } 
          else if (i == 1) {
            // Second sphere: top to bottom movement (opposite of first)
            offset = vec3(
              sin(t * speed + PI) * orbitRadius * 0.5,
              -sin(t * 0.5) * orbitRadius, // Opposite vertical movement
              cos(t * speed * 0.7 + PI) * orbitRadius * 0.5
            );
          }
          else if (uMovementPattern == 0) {
            // Orbital pattern
            offset = vec3(
              sin(t * speed + phaseOffset) * orbitRadius,
              cos(t * (speed * 0.7) + phaseOffset * 1.3) * (orbitRadius * 0.6),
              sin(t * (speed * 0.5) + phaseOffset * 0.9) * (orbitRadius * 0.8)
            );
          } 
          else if (uMovementPattern == 1) {
            // Wave pattern
            float wave = sin(t * 0.5) * 0.5;
            offset = vec3(
              sin(t * 0.2 + float(i) * 0.5) * orbitRadius,
              sin(t * 0.3 + float(i) * 0.7 + wave) * orbitRadius * 0.5,
              cos(t * 0.4 + float(i) * 0.6) * orbitRadius * 0.7
            );
          }
          else if (uMovementPattern == 2) {
            // Chaos pattern
            offset = vec3(
              sin(t * speed * 1.1 + sin(t * 0.4) * 2.0) * orbitRadius,
              cos(t * speed * 0.9 + sin(t * 0.5) * 1.5) * orbitRadius * 0.8,
              sin(t * speed * 0.7 + sin(t * 0.6) * 1.8) * orbitRadius * 0.6
            );
          }
          else {
            // Pulse pattern
            float pulse = (sin(t * 0.8) * 0.5 + 0.5) * 0.5 + 0.5;
            offset = vec3(
              sin(t * speed + phaseOffset) * orbitRadius * pulse,
              cos(t * (speed * 0.7) + phaseOffset * 1.3) * (orbitRadius * 0.6) * pulse,
              sin(t * (speed * 0.5) + phaseOffset * 0.9) * (orbitRadius * 0.8) * pulse
            );
          }

          // Apply individual rotation if enabled
          if (uIndividualRotation) {
            float rotSpeed = t * (0.2 + float(i) * 0.05);
            mat3 rot = rotateY(rotSpeed) * rotateX(rotSpeed * 0.7);
            offset = rot * offset;
          }

          // Apply sphere
          float sphere = sdSphere(pos + offset, radius);

          // Blend with smooth minimum
          result = smin(result, sphere, uSmoothness);
        }

        return result;
      }

      // Calculate normal at a point
      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(EPSILON, 0.0);
        return normalize(vec3(
          sdf(p + e.xyy) - sdf(p - e.xyy),
          sdf(p + e.yxy) - sdf(p - e.yxy),
          sdf(p + e.yyx) - sdf(p - e.yyx)
        ));
      }

      // Ray marching
      float raymarch(vec3 ro, vec3 rd) {
        float t = 0.0;

        for (int i = 0; i < MAX_STEPS; i++) {
          vec3 p = ro + rd * t;
          float d = sdf(p);

          // Hit check
          if (d < EPSILON) {
            return t;
          }

          // Distance check
          if (t > MAX_DIST) {
            break;
          }

          // Adaptive step size for better detail near surfaces
          t += d * 0.8;
        }

        return -1.0; // No hit
      }

      // Soft shadows calculation
      float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
        float result = 1.0;
        float t = mint;

        for (int i = 0; i < 32; i++) {
          if (t >= maxt) break;

          float h = sdf(ro + rd * t);

          if (h < EPSILON) {
            return 0.0;
          }

          result = min(result, k * h / t);
          t += h;
        }

        return result;
      }

      // Ambient occlusion calculation
      float ambientOcclusion(vec3 p, vec3 n) {
        float occ = 0.0;
        float weight = 1.0;

        for (int i = 0; i < 5; i++) {
          float dist = 0.01 + 0.02 * float(i * i);
          float h = sdf(p + n * dist);
          occ += (dist - h) * weight;
          weight *= 0.85;
        }

        return clamp(1.0 - occ, 0.0, 1.0);
      }

      // Lighting calculation
      vec3 lighting(vec3 p, vec3 rd, float t) {
        if (t < 0.0) {
          return vec3(0.0); // Return transparent color
        }

        vec3 normal = calcNormal(p);
        vec3 viewDir = -rd;

        // Base color
        vec3 baseColor = uSphereColor;

        // Ambient light
        vec3 ambient = baseColor * uAmbientIntensity;

        // Directional light
        vec3 lightDir = normalize(uLightPosition);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = baseColor * uLightColor * diff * uDiffuseIntensity;

        // Specular highlight
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), uSpecularPower);
        vec3 specular = uLightColor * spec * uSpecularIntensity;

        // Fresnel effect
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
        specular *= fresnel;

        // Ambient occlusion
        float ao = ambientOcclusion(p, normal);

        // Soft shadows
        float shadow = softShadow(p, lightDir, 0.01, 10.0, 16.0);

        // Combine lighting
        vec3 color = ambient * ao + (diffuse * shadow + specular) * ao;

        // Apply contrast
        color = pow(color, vec3(uContrast));

        return color;
      }

      void main() {
        // Calculate UV coordinates
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;

        // Camera setup
        vec3 ro = vec3(0.0, 0.0, -uCameraDistance);
        vec3 rd = normalize(vec3(uv, 1.0));

        // Apply slight camera rotation for more interesting view
        float camRotY = sin(uTime * 0.1) * 0.1;
        float camRotX = cos(uTime * 0.08) * 0.05;
        rd = rotateY(camRotY) * rotateX(camRotX) * rd;

        // Ray marching
        float t = raymarch(ro, rd);

        // Calculate hit position
        vec3 p = ro + rd * t;

        // Calculate color
        vec3 color = lighting(p, rd, t);

        // Apply fog with transparency
        if (t > 0.0) {
          float fogAmount = 1.0 - exp(-t * uFogDensity);
          color = mix(color, uBackgroundColor, fogAmount);
          fragColor = vec4(color, 1.0);
        } else {
          // Transparent background
          fragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      }
    `;
  }
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3.0, 3.0]} /> {/* Much larger to allow for extended fade out */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false} /* Prevents z-fighting with background elements */
        blending={THREE.AdditiveBlending} /* Enhances glow effect at edges */
      />
    </mesh>
  );
};

export default AbstractBackground;