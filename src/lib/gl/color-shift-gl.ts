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

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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
    vec3 hsv = rgb2hsv(rgb / 255.0);
    hsv.x = fract(hsv.x + u_hue / 360.0);
    hsv.y = clamp(hsv.y + u_sat / 100.0, 0.0, 1.0);
    rgb = hsv2rgb(hsv) * 255.0;
  }
  fragColor = vec4(rgb / 255.0, a);
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
