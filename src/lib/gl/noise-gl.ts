import { runShader } from './gl-core'

/** Simplified block noise: average luma per block → probabilistic B/W speckle. */
export const NOISE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_block;
uniform float u_seed;
uniform float u_strength;
in vec2 v_uv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + u_seed) * 43758.5453);
}

void main() {
  vec2 px = v_uv * vec2(textureSize(u_image, 0));
  vec2 blockId = floor(px / u_block);
  vec2 blockCenter = (blockId + 0.5) * u_block;
  vec2 sampleUv = blockCenter / vec2(textureSize(u_image, 0));
  vec3 src = texture(u_image, clamp(sampleUv, 0.0, 1.0)).rgb;
  float luma = dot(src, vec3(0.299, 0.587, 0.114));
  float contrast = 0.25 + u_strength * 0.4;
  float pWhite = clamp(0.5 + (luma - 0.5) * (1.0 + contrast * 2.0), 0.04, 0.96);
  float rnd = hash(blockId);
  float v = rnd < pWhite ? 1.0 : 0.0;
  fragColor = vec4(vec3(v), texture(u_image, v_uv).a);
}`

export function glApplyNoiseRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
  seed: number,
): HTMLCanvasElement | null {
  const s = Math.min(1, Math.max(0, strength))
  const block = Math.max(2, Math.round(2 + (1 - s) * 24))
  return runShader(NOISE_FRAG, source, width, height, {
    floats: {
      u_block: block,
      u_seed: seed,
      u_strength: s,
    },
  })
}
