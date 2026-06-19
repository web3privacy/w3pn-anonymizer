import { runShader } from './gl-core'

/** Legacy thermal effect id now renders abstract Color Ball blobs. Source alpha only. */
export const THERMAL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_strength;
uniform float u_seed;
in vec2 v_uv;
out vec4 fragColor;

vec3 palette(float t) {
  t = fract(t);
  return vec3(
    0.16 + 0.84 * (0.5 + 0.5 * sin(6.28318 * (t + 0.00))),
    0.14 + 0.86 * (0.5 + 0.5 * sin(6.28318 * (t + 0.34))),
    0.20 + 0.80 * (0.5 + 0.5 * sin(6.28318 * (t + 0.68)))
  );
}

float blob(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  float f = 1.0 - smoothstep(r * 0.14, r, d);
  return f * f;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash1(float n) {
  return fract(sin(n * 127.113 + u_seed * 911.77) * 43758.5453123);
}

vec2 seededCenter(float i) {
  return vec2(
    -0.08 + hash1(i + 1.17) * 1.16,
    -0.08 + hash1(i + 7.31) * 1.16
  );
}

void main() {
  vec4 src = texture(u_image, v_uv);
  vec2 p = v_uv;
  vec2 centered = (p - 0.5) * vec2(1.18, 1.0);
  float phase = u_seed * 6.28318;
  float swirl = sin((p.x * 5.7 + p.y * 4.3) * 6.28318 + phase) * (0.06 + u_strength * 0.08);

  float w0 = blob(p, seededCenter(0.0), 0.34 + hash1(12.0) * 0.18 + u_strength * 0.14);
  float w1 = blob(p, seededCenter(1.0), 0.30 + hash1(13.0) * 0.16 + u_strength * 0.12);
  float w2 = blob(p, seededCenter(2.0), 0.32 + hash1(14.0) * 0.20 + u_strength * 0.16);
  float w3 = blob(p, seededCenter(3.0), 0.26 + hash1(15.0) * 0.16 + u_strength * 0.08);
  float w4 = blob(p, seededCenter(4.0), 0.28 + hash1(16.0) * 0.18 + u_strength * 0.10);
  float base = 0.24;
  vec3 color =
    palette(u_seed + 0.02 + swirl) * base +
    palette(u_seed + 0.08 + swirl + p.y * 0.12) * w0 +
    palette(u_seed + 0.31 + swirl + p.x * 0.10) * w1 +
    palette(u_seed + 0.58 + swirl - p.y * 0.08) * w2 +
    palette(u_seed + 0.76 + swirl + p.x * 0.06) * w3 +
    palette(u_seed + 0.92 + swirl - p.x * 0.05) * w4;
  float sum = base + w0 + w1 + w2 + w3 + w4;
  color /= max(sum, 0.001);

  float vignette = mix(0.72, 1.08, 1.0 - smoothstep(0.22, 0.78, length(centered)));
  float grain = (hash(gl_FragCoord.xy) - 0.5) * (0.025 + u_strength * 0.055);
  fragColor = vec4(clamp(color * vignette + grain, 0.0, 1.0), src.a);
}`

export function glApplyThermalRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
  seed = 0,
): HTMLCanvasElement | null {
  return runShader(THERMAL_FRAG, source, width, height, {
    floats: {
      u_strength: Math.min(1, Math.max(0, strength)),
      u_seed: seed,
    },
  })
}
