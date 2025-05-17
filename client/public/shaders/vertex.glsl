// Basic vertex shader for particles and effects
uniform float uTime;
uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uMouse;

attribute float aScale;
attribute vec3 aColor;

varying vec3 vColor;
varying vec2 vUv;

void main() {
  vUv = uv;
  vColor = aColor;
  
  // Calculate position with slight wobble based on time
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Add subtle movement based on uTime
  float wobble = sin(uTime * 0.3 + modelPosition.x * 5.0) * 0.05;
  modelPosition.y += wobble;
  
  // Apply mouse influence if close enough
  float mouseDistance = distance(modelPosition.xy, uMouse);
  float mouseInfluence = smoothstep(2.0, 0.0, mouseDistance);
  
  // Move slightly away from mouse position
  vec2 mouseDir = normalize(modelPosition.xy - uMouse);
  modelPosition.xy += mouseDir * mouseInfluence * 0.2;
  
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  // Point size varies with aScale
  gl_PointSize = uSize * aScale;
  
  // Size attenuation
  gl_PointSize *= (1.0 / - viewPosition.z);
  
  gl_Position = projectedPosition;
}
