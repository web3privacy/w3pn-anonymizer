/**
 * Animated WebGL renderer for the hypnotic Fraser-style spiral overlay. Unlike
 * gl-core (single-shot image effects), this owns a visible canvas + animation
 * loop driven by the caller's requestAnimationFrame. Returns null if WebGL is
 * unavailable so callers can keep the SVG fallback.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_pointer;   // -1..1, smoothed
uniform float u_intensity; // 0..1 morph/visibility
#define TAU 6.28318530718

// Triangle wave 0..1 from a phase in turns — crisp, cheap, repeatable.
float tri(float p) { return abs(fract(p) * 2.0 - 1.0); }

void main() {
  vec2 uv = v_uv - 0.5;
  uv.x *= u_res.x / u_res.y;

  // Pointer nudges the gaze center for a subtle "follow" parallax.
  vec2 c = uv - u_pointer * 0.06;
  float r = length(c);
  float ang = atan(c.y, c.x) / TAU;            // turns, -0.5..0.5
  float lr = log(r + 0.03);                     // even arm spacing in log-radius

  // Pointer Y tunes arm fineness, pointer X tunes drift speed/direction.
  float arms = 13.0 + floor((u_pointer.y * 0.5 + 0.5) * 12.0); // ~13..25 fine arms
  float speed = 0.7 + u_pointer.x * 0.55;
  float t = u_time * speed;

  // Layer 1 — dotted spiral lattice: fine beads arranged along log-spiral arms,
  // drifting inward for a strong motion aftereffect. Sheared cell grid → spiral.
  vec2 cell = vec2(ang * arms + lr * 3.5 - t * 0.12, lr * 7.0 - t * 0.62);
  vec2 g = fract(cell) - 0.5;
  float d = length(g);
  float dots = 1.0 - smoothstep(0.20, 0.34, d);

  // Layer 2 — counter-rotating fine spiral: shimmering Fraser-style interference.
  float shimmer = smoothstep(0.55, 0.50, tri(-arms * 0.75 * ang + 9.0 * lr + t * 0.46));

  // Layer 3 — concentric rings breathing outward for multi-layer depth.
  float rings = smoothstep(0.50, 0.45, tri(8.5 * lr - t * 0.78));

  float field = clamp(dots * 0.95 + shimmer * 0.22 + rings * 0.16, 0.0, 1.0);

  // High-contrast near-monochrome base keeps it sharp, not washed in green.
  vec3 dark = vec3(0.015, 0.025, 0.030);
  vec3 light = vec3(0.92, 0.96, 0.94);
  vec3 col = mix(dark, light, field);

  // Brand: green "eye" dot at the very center, plus a whisper of green tint.
  vec3 green = vec3(0.0, 1.0, 0.47);
  float eye = smoothstep(0.11, 0.0, r);
  col = mix(col, green, eye * 0.9);
  col += green * smoothstep(0.045, 0.0, r) * 0.85;
  col += green * field * 0.05;

  // Disc vignette so the spiral fades into the background at the edges.
  float vig = smoothstep(1.05, 0.10, r);
  float alpha = u_intensity * vig;
  // Premultiplied output to match blendFunc(ONE, ONE_MINUS_SRC_ALPHA).
  gl_FragColor = vec4(col * alpha, alpha);
}`

export type HypnoRenderer = {
  render: (timeSec: number, pointer: { x: number; y: number }, intensity: number) => void
  resize: () => void
  dispose: () => void
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('hypno shader compile failed', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function createHypnoRenderer(canvas: HTMLCanvasElement, dprCap = 2): HypnoRenderer | null {
  const gl = (canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true })
    || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('hypno program link failed', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const posLoc = gl.getAttribLocation(prog, 'a_pos')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  const uTime = gl.getUniformLocation(prog, 'u_time')
  const uRes = gl.getUniformLocation(prog, 'u_res')
  const uPointer = gl.getUniformLocation(prog, 'u_pointer')
  const uIntensity = gl.getUniformLocation(prog, 'u_intensity')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  const resize = () => {
    const dpr = Math.min(dprCap, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()

  return {
    render(timeSec, pointer, intensity) {
      gl.useProgram(prog)
      gl.uniform1f(uTime, timeSec)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      gl.uniform1f(uIntensity, intensity)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    resize,
    dispose() {
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
