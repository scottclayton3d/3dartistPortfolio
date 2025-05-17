uniform float time;
uniform vec3 color;
uniform float opacity;
uniform float glowIntensity;
uniform float pulseSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  // Calculate rim lighting based on view angle to create glow at edges
  vec3 viewDir = normalize(vViewPosition);
  float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
  
  // Create pulsing effect
  float pulse = 0.5 * sin(time * pulseSpeed) + 0.5;
  
  // Enhance rim with pulse
  rim = smoothstep(0.3, 1.0, rim);
  float glowFactor = rim * glowIntensity * (0.8 + 0.2 * pulse);
  
  // Final color with glowing edges
  vec3 finalColor = mix(color, vec3(1.0), glowFactor);
  gl_FragColor = vec4(finalColor, opacity);
}