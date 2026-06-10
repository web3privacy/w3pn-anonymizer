import { runShader } from './gl-core'

/** Rec.601 luma → thermal false-color gradient (simplified vs CPU islands). */
export const THERMAL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_strength;
in vec2 v_uv;
out vec4 fragColor;

vec3 thermal(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(0.0, 0.0, 0.5);
  vec3 c1 = vec3(0.0, 0.5, 1.0);
  vec3 c2 = vec3(0.0, 1.0, 0.5);
  vec3 c3 = vec3(1.0, 1.0, 0.0);
  vec3 c4 = vec3(1.0, 0.0, 0.0);
  vec3 c5 = vec3(1.0, 0.0, 0.5);
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}

void main() {
  vec4 src = texture(u_image, v_uv);
  float luma = dot(src.rgb, vec3(0.299, 0.587, 0.114)) / 255.0;
  float boost = 0.15 + u_strength * 0.35;
  luma = clamp(luma * (0.85 + u_strength * 0.4) + boost * 0.1, 0.0, 1.0);
  vec3 tc = thermal(luma) * 255.0;
  fragColor = vec4(tc, src.a);
}`

export function glApplyThermalRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
): HTMLCanvasElement | null {
  return runShader(THERMAL_FRAG, source, width, height, {
    floats: { u_strength: Math.min(1, Math.max(0, strength)) },
  })
}
