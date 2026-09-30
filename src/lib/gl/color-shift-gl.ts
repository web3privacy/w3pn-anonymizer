import { runShader } from './gl-core'

/** Chromatic aberration + optional hue shift (simplified color-shift). */
export const COLOR_SHIFT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_shift;
uniform float u_hue;
uniform float u_sat;
in vec2 v_uv;
out vec4 fragColor;

vec3 rgb2hsl(vec3 c) {
  float hi = max(c.r, max(c.g, c.b));
  float lo = min(c.r, min(c.g, c.b));
  float d = hi - lo;
  float l = (hi + lo) * 0.5;
  if (d < 1.0e-7) return vec3(0.0, 0.0, l);
  float h;
  if (hi == c.r) h = (c.g - c.b) / d;
  else if (hi == c.g) h = (c.b - c.r) / d + 2.0;
  else h = (c.r - c.g) / d + 4.0;
  return vec3(fract(h / 6.0), d / (1.0 - abs(2.0 * l - 1.0)), l);
}

float hueChannel(float p, float q, float t) {
  t = fract(t);
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 c) {
  float q = c.z < 0.5 ? c.z * (1.0 + c.y) : c.z + c.y - c.z * c.y;
  float p = 2.0 * c.z - q;
  return vec3(hueChannel(p, q, c.x + 1.0 / 3.0), hueChannel(p, q, c.x), hueChannel(p, q, c.x - 1.0 / 3.0));
}

void main() {
  vec2 uv = v_uv;
  float dx = u_shift / float(textureSize(u_image, 0).x);
  float r = texture(u_image, clamp(uv + vec2(dx, 0.0), 0.0, 1.0)).r;
  float g = texture(u_image, uv).g;
  float b = texture(u_image, clamp(uv - vec2(dx, 0.0), 0.0, 1.0)).b;
  float a = texture(u_image, uv).a;
  vec3 rgb = vec3(r, g, b);
  if (abs(u_hue) > 0.001 || abs(u_sat) > 0.001) {
    // Texture samples are already normalized. Match the CPU HSL path without
    // dividing them by 255 again (which previously made the image nearly black).
    vec3 hsl = rgb2hsl(rgb);
    hsl.x = fract(hsl.x + u_hue / 360.0);
    hsl.y = clamp(hsl.y + u_sat / 100.0, 0.0, 1.0);
    rgb = hsl2rgb(hsl);
  }
  fragColor = vec4(rgb, a);
}`

export function glApplyColorShift(
  source: TexImageSource,
  width: number,
  height: number,
  amount: number,
  hueRotation = 0,
  satBoost = 0,
): HTMLCanvasElement | null {
  const shift = Math.max(1, Math.floor((amount / 100) * 20))
  return runShader(COLOR_SHIFT_FRAG, source, width, height, {
    floats: {
      u_shift: shift,
      u_hue: hueRotation,
      u_sat: satBoost,
    },
  })
}
