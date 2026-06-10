import type { ColorAdjustments } from '../../types'
import { runShader } from './gl-core'

/**
 * WebGL color-adjustment shader. Mirrors the CPU path in effects.ts:
 *  - per-channel transfer via the SAME 256-entry LUT (uploaded as a texture),
 *    so brightness/contrast/shadows/highlights match exactly;
 *  - saturation / threshold done in the same Rec.601 integer-ish space.
 *
 * Visual parity (not bit-exact) is the goal — saturation uses float math where
 * the CPU uses fixed-point >>10, which differs by at most ~1/255.
 */
export const COLOR_ADJUST_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform sampler2D u_lut;
uniform float u_satScale; // (1 + saturation/100), quantized to match CPU
uniform int u_mode;       // 0 = LUT only, 1 = LUT + saturation, 2 = threshold
in vec2 v_uv;
out vec4 fragColor;

float lutLookup(float c) {
  float idx = (floor(c * 255.0 + 0.5) + 0.5) / 256.0;
  return texture(u_lut, vec2(idx, 0.5)).r;
}

void main() {
  vec4 src = texture(u_image, v_uv);
  float r = lutLookup(src.r);
  float g = lutLookup(src.g);
  float b = lutLookup(src.b);

  if (u_mode == 2) {
    float R = r * 255.0, G = g * 255.0, B = b * 255.0;
    float luma = floor((306.0 * R + 601.0 * G + 117.0 * B) / 1024.0);
    float v = luma >= 128.0 ? 1.0 : 0.0;
    fragColor = vec4(v, v, v, src.a);
    return;
  }

  if (u_mode == 1) {
    float R = r * 255.0, G = g * 255.0, B = b * 255.0;
    float luma = floor((306.0 * R + 601.0 * G + 117.0 * B) / 1024.0);
    R = clamp(luma + (R - luma) * u_satScale, 0.0, 255.0);
    G = clamp(luma + (G - luma) * u_satScale, 0.0, 255.0);
    B = clamp(luma + (B - luma) * u_satScale, 0.0, 255.0);
    fragColor = vec4(R / 255.0, G / 255.0, B / 255.0, src.a);
    return;
  }

  fragColor = vec4(r, g, b, src.a);
}`

export type ColorAdjustMode = 0 | 1 | 2

/**
 * Expand the single-channel 256-entry transfer LUT into a 256×1 RGBA8 buffer
 * (value in R/G/B, opaque A) suitable for upload as a GL texture.
 */
export function lutToRGBA(lut: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(256 * 4)
  for (let i = 0; i < 256; i++) {
    const v = lut[i]
    const o = i * 4
    out[o] = v
    out[o + 1] = v
    out[o + 2] = v
    out[o + 3] = 255
  }
  return out
}

/** Compute the shader mode + saturation scale for a given adjustment. */
export function colorAdjustModeAndScale(adj: ColorAdjustments): { mode: ColorAdjustMode; satScale: number } {
  const sa = adj.saturation / 100
  if (adj.preset === 'threshold') return { mode: 2, satScale: 1 }
  if (sa !== 0) return { mode: 1, satScale: Math.round((1 + sa) * 1024) / 1024 }
  return { mode: 0, satScale: 1 }
}

/**
 * Run the color-adjust shader on `source`, returning the shared GL canvas with
 * the adjusted result, or null if WebGL is unavailable / failed (CPU fallback).
 */
export function glApplyColorAdjustments(
  source: TexImageSource,
  width: number,
  height: number,
  lut: Uint8ClampedArray,
  adj: ColorAdjustments,
): HTMLCanvasElement | null {
  const { mode, satScale } = colorAdjustModeAndScale(adj)
  return runShader(COLOR_ADJUST_FRAG, source, width, height, {
    lut: lutToRGBA(lut),
    floats: { u_satScale: satScale },
    ints: { u_mode: mode },
  })
}
