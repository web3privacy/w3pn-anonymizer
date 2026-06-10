import { runShader } from './gl-core'

/** Dark silhouette with vignette — simplified vs CPU multi-scale edge smear. */
export const SILHOUETTE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_strength;
in vec2 v_uv;
out vec4 fragColor;

float lumaAt(vec2 uv) {
  vec3 c = texture(u_image, clamp(uv, 0.0, 1.0)).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 px = v_uv;
  float invW = 1.0 / float(textureSize(u_image, 0).x);
  float invH = 1.0 / float(textureSize(u_image, 0).y);
  float edge = 0.0;
  edge += abs(lumaAt(px + vec2(invW, 0.0)) - lumaAt(px - vec2(invW, 0.0)));
  edge += abs(lumaAt(px + vec2(0.0, invH)) - lumaAt(px - vec2(0.0, invH)));
  vec2 c = px - 0.5;
  float vignette = clamp(1.0 - length(c) * 0.9, 0.0, 1.0);
  float v = clamp(20.0 + edge * (80.0 + u_strength * 120.0) + vignette * 72.0, 0.0, 185.0);
  fragColor = vec4(v * 0.25 / 255.0, v * 0.28 / 255.0, v * 0.32 / 255.0, texture(u_image, v_uv).a);
}`

export function glApplySilhouetteRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
): HTMLCanvasElement | null {
  return runShader(SILHOUETTE_FRAG, source, width, height, {
    floats: { u_strength: Math.min(1, Math.max(0, strength)) },
  })
}
