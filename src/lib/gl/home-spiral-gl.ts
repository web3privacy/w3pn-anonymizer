/**
 * Fullscreen WebGL renderer for the home-screen hypnotic spiral. Draws a dense,
 * high-contrast, strictly black/white logarithmic spiral that rotates inward at
 * a brisk, steady pace (motion-aftereffect "Starry Night" illusion), with a tiny
 * green dot at the dead center as the gaze anchor / brand accent.
 *
 * Designed for a steady 60fps: one full-screen triangle, no textures, cheap
 * trigonometry, and analytic antialiasing via screen-space derivatives so the
 * arms stay crisp (no muddy gray bands) all the way to the edges.
 *
 * Returns null when WebGL (or the derivatives extension) is unavailable so the
 * caller can fall back to a static CSS background.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_pointer;   // -1..1, smoothed
uniform float u_intensity; // 0..1 fade-in over black
#define TAU 6.28318530718

// Antialiased step using screen-space derivative width — keeps bands hard
// black/white with a single ~1px transition instead of a gray gradient.
float aastep(float threshold, float value) {
  float w = fwidth(value);
  return smoothstep(threshold - w, threshold + w, value);
}

// One logarithmic-spiral layer. dir flips both the winding handedness and the
// rotation direction, so alternating layers counter-rotate against each other.
float spiralLayer(float r, float ang, float dir, float arms, float twist, float spin) {
  float lr = log(r + 0.0016);
  float phase = dir * (ang / TAU * arms + lr * twist) - u_time * spin * dir;
  return aastep(0.5, fract(phase));
}

void main() {
  // Aspect-correct so the spiral stays circular while filling the viewport.
  vec2 uv = v_uv - 0.5;
  uv.x *= u_res.x / u_res.y;

  // Subtle gaze parallax — the whole field leans toward the pointer.
  vec2 c = uv - u_pointer * 0.045;
  float r = length(c);
  float ang = atan(c.y, c.x);

  // Three concentric, counter-rotating logarithmic-spiral layers nested inside
  // one another (outer CW, middle CCW, inner CW) for a layered illusion. Each
  // ring spins a little faster toward the centre.
  float outer = spiralLayer(r, ang, +1.0, 24.0, 5.6, 1.15);
  float mid   = spiralLayer(r, ang, -1.0, 19.0, 6.4, 1.7);
  float inner = spiralLayer(r, ang, +1.0, 14.0, 7.4, 2.45);

  // Ring boundaries (in aspect-corrected units).
  float rMid = 0.30;
  float rInner = 0.135;
  float band = r < rInner ? inner : (r < rMid ? mid : outer);

  // Thin black dividers mask the seams and emphasise the nested rings.
  float div1 = 1.0 - smoothstep(0.004, 0.013, abs(r - rMid));
  float div2 = 1.0 - smoothstep(0.004, 0.013, abs(r - rInner));
  vec3 col = vec3(band);
  col = mix(col, vec3(0.0), max(div1, div2));

  // Tiny green center dot (gaze anchor). Kept small per brand direction.
  float dotR = 0.007;
  float dot = 1.0 - smoothstep(dotR, dotR + 0.004, r);
  // Thin black halo so the dot reads against either band color.
  float halo = (1.0 - smoothstep(dotR + 0.004, dotR + 0.011, r)) * (1.0 - dot);
  col = mix(col, vec3(0.0), halo);
  col = mix(col, vec3(0.0, 1.0, 0.47), dot);

  // Fade the whole field in/out over a black background.
  col *= clamp(u_intensity, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`

export type HomeSpiralRenderer = {
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
    console.warn('home spiral shader compile failed', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function createHomeSpiralRenderer(canvas: HTMLCanvasElement, dprCap = 2): HomeSpiralRenderer | null {
  const gl = (canvas.getContext('webgl', { alpha: false, antialias: true, premultipliedAlpha: false })
    || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  if (!gl) return null

  // Required for fwidth-based antialiasing in the fragment shader.
  if (!gl.getExtension('OES_standard_derivatives')) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('home spiral program link failed', gl.getProgramInfoLog(prog))
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
      gl.clearColor(0, 0, 0, 1)
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
