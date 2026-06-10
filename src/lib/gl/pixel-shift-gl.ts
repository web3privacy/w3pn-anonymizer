import { runShader } from './gl-core'

/** Wave pixel shift (default distort sub-effect). */
export const PIXEL_SHIFT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_maxX;
uniform float u_maxY;
uniform int u_type;
in vec2 v_uv;
out vec4 fragColor;

void main() {
  ivec2 size = textureSize(u_image, 0);
  float w = float(size.x);
  float h = float(size.y);
  float x = v_uv.x * w;
  float y = v_uv.y * h;
  float srcX = x;
  float srcY = y;
  if (u_type == 0) {
    float xShift = floor(sin(y * 0.08) * u_maxX);
    float yShift = u_maxY > 0.0 ? floor(cos(y * 0.05) * u_maxY) : 0.0;
    srcX = clamp(x + xShift, 0.0, w - 1.0);
    srcY = clamp(y + yShift, 0.0, h - 1.0);
  } else if (u_type == 1) {
    float xShift = floor((y / h - 0.5) * u_maxX * 2.0);
    float yShift = u_maxY > 0.0 ? floor((x / w - 0.5) * u_maxY * 2.0) : 0.0;
    srcX = clamp(x + xShift, 0.0, w - 1.0);
    srcY = clamp(y + yShift, 0.0, h - 1.0);
  }
  vec2 srcUv = vec2((srcX + 0.5) / w, (srcY + 0.5) / h);
  fragColor = texture(u_image, srcUv);
}`

export type GlPixelShiftType = 'wave' | 'shear'

export function glApplyPixelShift(
  source: TexImageSource,
  width: number,
  height: number,
  amount: number,
  pixelShiftX?: number,
  pixelShiftY?: number,
  shiftType: GlPixelShiftType = 'wave',
): HTMLCanvasElement | null {
  const maxX = pixelShiftX != null ? pixelShiftX : Math.max(1, Math.floor((amount / 100) * 40))
  const maxY = pixelShiftY != null ? pixelShiftY : 0
  return runShader(PIXEL_SHIFT_FRAG, source, width, height, {
    floats: { u_maxX: maxX, u_maxY: maxY },
    ints: { u_type: shiftType === 'shear' ? 1 : 0 },
  })
}
