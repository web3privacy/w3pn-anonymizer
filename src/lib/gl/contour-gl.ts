import { runShader } from './gl-core'

/** Sobel edge magnitude on luma — simplified vs CPU warp field. */
export const CONTOUR_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_invW;
uniform float u_invH;
uniform float u_threshold;
uniform float u_gain;
in vec2 v_uv;
out vec4 fragColor;

float lumaAt(vec2 uv) {
  vec3 c = texture(u_image, clamp(uv, 0.0, 1.0)).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  float dx = u_invW;
  float dy = u_invH;
  float tl = lumaAt(v_uv + vec2(-dx, -dy));
  float t  = lumaAt(v_uv + vec2(0.0, -dy));
  float tr = lumaAt(v_uv + vec2(dx, -dy));
  float l  = lumaAt(v_uv + vec2(-dx, 0.0));
  float r  = lumaAt(v_uv + vec2(dx, 0.0));
  float bl = lumaAt(v_uv + vec2(-dx, dy));
  float b  = lumaAt(v_uv + vec2(0.0, dy));
  float br = lumaAt(v_uv + vec2(dx, dy));
  float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
  float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
  float mag = clamp(sqrt(gx * gx + gy * gy) * u_gain, 0.0, 255.0);
  float edge = mag >= u_threshold ? mag : 0.0;
  fragColor = vec4(vec3(edge / 255.0), texture(u_image, v_uv).a);
}`

export function glApplyContourRect(
  source: TexImageSource,
  width: number,
  height: number,
  strength: number,
): HTMLCanvasElement | null {
  const s = Math.min(1, Math.max(0, strength))
  const threshold = Math.min(245, Math.max(12, 255 - s * 200))
  const gain = 0.5 + s * 2.2
  return runShader(CONTOUR_FRAG, source, width, height, {
    floats: {
      u_invW: 1 / width,
      u_invH: 1 / height,
      u_threshold: threshold,
      u_gain: gain,
    },
  })
}
