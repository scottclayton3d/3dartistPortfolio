// Basic fragment shader for glowing particles
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vColor;
varying vec2 vUv;

void main() {
  // Calculate distance from center of point
  float distanceToCenter = length(gl_PointCoord - 0.5);
  
  // Circular particles with soft edge falloff
  float strength = 0.05 / distanceToCenter - 0.1;
  
  // Adds pulsing effect
  float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
  strength *= mix(0.8, 1.2, pulse);
  
  // Apply color with some variation from uTime
  vec3 finalColor = mix(vColor, uColor, 0.5);
  finalColor += sin(uTime * 0.2) * 0.1;
  
  // Final color with alpha based on strength
  gl_FragColor = vec4(finalColor, strength);
}
