import { runShader } from './gl-core'

export const mapPixelateBlockSize = (strength: number): number => {
  const s = Math.min(1, Math.max(0, Number.isFinite(strength) ? strength : 0.5))
  return Math.max(4, Math.round(4 + Math.pow(s, 1.7) * 48))
}

export const pixelateStrengthForBlockSize = (blockSize: number): number => {
  const normalized = Math.min(1, Math.max(0, (blockSize - 4) / 48))
  return Math.pow(normalized, 1 / 1.7)
}

export const PIXELATE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_invW;
uniform float u_invH;
uniform float u_block;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 px = vec2(v_uv.x / u_invW, v_uv.y / u_invH);
  vec2 blockPx = floor(px / u_block) * u_block + u_block * 0.5;
  vec2 sampleUv = vec2(blockPx.x * u_invW, blockPx.y * u_invH);
  fragColor = texture(u_image, clamp(sampleUv, 0.0, 1.0));
}`

export function glApplyPixelateRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
): HTMLCanvasElement | null {
  const block = mapPixelateBlockSize(strength)
  return runShader(PIXELATE_FRAG, source, width, height, {
    floats: {
      u_block: block,
      u_invW: 1 / width,
      u_invH: 1 / height,
    },
  })
}
