#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define TAU 6.28318530718

uniform float time;
uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform float noiseIntensity;
uniform vec2 mousePosition;

varying vec2 vUv;

// Function to create smooth noise
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Smoothing
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // 4 corners
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    
    // Bilinear interpolation
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 3D noise function based on 2D slices
float noise3D(vec3 p) {
    float xy = noise(p.xy);
    float yz = noise(p.yz);
    float zx = noise(p.zx);
    return (xy + yz + zx) / 3.0;
}

// Movement functions
vec3 translate(vec3 p, vec3 offset) {
    return p - offset;
}

vec3 rotateY(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat3 m = mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
    return m * p;
}

vec3 rotateX(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat3 m = mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
    return m * p;
}

// SDF shapes
float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdBox(vec3 p, vec3 size) {
    vec3 d = abs(p) - size;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

// Distance estimation for an abstract, organic shape
float getDistance(vec3 p) {
    // Apply movement
    vec3 p1 = rotateY(p, time * 0.2);
    p1 = rotateX(p1, time * 0.1);
    
    // Add some noise to the position
    float noise = noise3D(p * 0.5 + time * 0.1) * noiseIntensity;
    p1 += noise * 0.5;
    
    // Base shape - blend of basic primitives
    float sphere = sdSphere(p1, 1.2);
    float box = sdBox(p1, vec3(0.8, 0.8, 0.8));
    float torus = sdTorus(p1, vec2(1.0, 0.3));
    
    // Create organic shape through smooth blending
    float pulseFactor = sin(time) * 0.2 + 0.8;
    float d = mix(sphere, box, 0.5 + sin(time * 0.5) * 0.5);
    d = mix(d, torus, 0.5 + sin(time * 0.3) * 0.5);
    
    // Deform with mouse influence
    vec2 mouseInfl = (mousePosition * 2.0 - 1.0) * 0.5;
    d += sin(p.x * 3.0 + time + mouseInfl.x) * sin(p.z * 4.0 + time + mouseInfl.y) * 0.1;
    
    // Add smaller geometric details
    vec3 p2 = rotateY(p, -time * 0.4);
    float smallSpheres = sdSphere(p2 * 2.0, 0.5 + sin(time) * 0.1);
    
    return mix(d, smallSpheres, 0.3) * pulseFactor;
}

// Ray marching to find intersection
vec2 rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    float material = 0.0;
    
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = getDistance(p);
        
        // Assign material ID based on position and distance
        if (dS < SURF_DIST) {
            float pattern = noise3D(p * 2.0 + vec3(0.0, time * 0.1, 0.0));
            material = pattern * 2.0;
            break;
        }
        
        dO += dS;
        
        if (dO > MAX_DIST) break;
    }
    
    return vec2(dO, material);
}

// Calculate normal at a point
vec3 getNormal(vec3 p) {
    float d = getDistance(p);
    vec2 e = vec2(0.001, 0.0);
    
    vec3 n = d - vec3(
        getDistance(p - e.xyy),
        getDistance(p - e.yxy),
        getDistance(p - e.yyx)
    );
    
    return normalize(n);
}

// Lighting calculation
vec3 getLight(vec3 p, vec3 rd, float material) {
    vec3 norm = getNormal(p);
    
    // Main light source
    vec3 lightPos = vec3(2.0, 4.0, -3.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(norm, lightDir), 0.0);
    
    // Shadows
    float d = rayMarch(p + norm * SURF_DIST * 2.0, lightDir).x;
    if (d < length(lightPos - p)) diff *= 0.5;
    
    // Reflections and environment
    vec3 reflected = reflect(rd, norm);
    float ref = max(0.0, dot(reflected, lightDir));
    float spec = pow(ref, 32.0);
    
    // Material coloring based on the position and material ID
    vec3 baseColor = mix(color1, color2, material);
    baseColor = mix(baseColor, color3, noise3D(p * 3.0) * 0.5);
    
    // Final coloring with lighting
    vec3 col = baseColor * diff;
    col += vec3(1.0) * spec * 0.3;
    col += baseColor * 0.1; // ambient light
    
    // Add rim lighting
    float rim = 1.0 - max(dot(-rd, norm), 0.0);
    rim = pow(rim, 3.0);
    col += vec3(0.3, 0.5, 1.0) * rim * 0.5;
    
    return col;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;
    
    // Setup ray
    vec3 ro = vec3(0.0, 0.0, -4.0); // ray origin (camera position)
    vec3 rd = normalize(vec3(uv, 1.0)); // ray direction
    
    // Apply some camera movement
    ro = rotateY(ro, sin(time * 0.2) * 0.3);
    rd = rotateY(rd, sin(time * 0.2) * 0.3);
    
    // Get distance to the scene
    vec2 result = rayMarch(ro, rd);
    float d = result.x;
    float material = result.y;
    
    // Coloring
    vec3 col;
    
    if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        col = getLight(p, rd, material);
        
        // Add depth fog
        float fogFactor = 1.0 - exp(-d * 0.05);
        vec3 fogColor = mix(color2, color3, noise(uv + time * 0.1) * 0.5);
        col = mix(col, fogColor, fogFactor * 0.6);
    } else {
        // Background gradient with animated noise
        float n = noise(uv * 3.0 + time * 0.1) * 0.1;
        vec3 bg1 = mix(color2 * 0.2, color3 * 0.2, n);
        vec3 bg2 = mix(color1 * 0.1, color2 * 0.1, n);
        col = mix(bg1, bg2, length(uv) * 0.5 + 0.5);
    }
    
    // Vignette effect
    float vignette = 1.0 - dot(uv * 0.5, uv * 0.5);
    vignette = pow(vignette, 1.5);
    col *= vignette;
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}