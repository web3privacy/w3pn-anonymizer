/**
 * Minimal, reusable WebGL2 layer for pixel-parallel image effects.
 *
 * Design goals:
 *  - A single shared offscreen GL canvas + context (lazy, cached).
 *  - Program cache keyed by shader source, so each effect compiles once.
 *  - A fullscreen-quad runner: upload a source (canvas/image/bitmap) as a
 *    texture, run a fragment shader, leave the result on the shared GL canvas
 *    ready to be blitted back onto a 2D context.
 *  - Capability detection + total isolation: every consumer keeps a CPU
 *    fallback, and any GL failure is surfaced as `null`/`false` rather than
 *    throwing into the render loop.
 *
 * Privacy: everything runs locally in the browser's GPU; nothing leaves it.
 */

let glState: { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null | undefined
const programCache = new Map<string, WebGLProgram>()

// Fullscreen quad covering clip space; uv set so texture row 0 maps to the
// top of the output (we use UNPACK_FLIP_Y so the uploaded canvas isn't mirrored).
const QUAD_VERTS = new Float32Array([
  -1, -1, 0, 0,
  1, -1, 1, 0,
  -1, 1, 0, 1,
  -1, 1, 0, 1,
  1, -1, 1, 0,
  1, 1, 1, 1,
])

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

function initGL(): { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null {
  if (glState !== undefined) return glState
  try {
    if (typeof document === 'undefined') { glState = null; return null }
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const gl = canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) { glState = null; return null }

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTS, gl.STATIC_DRAW)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    glState = { canvas, gl }
    return glState
  } catch {
    glState = null
    return null
  }
}

export function isWebGLAvailable(): boolean {
  return initGL() !== null
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function getProgram(gl: WebGL2RenderingContext, fragSource: string): WebGLProgram | null {
  const cached = programCache.get(fragSource)
  if (cached) return cached
  const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource)
  if (!vert || !frag) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.bindAttribLocation(program, 0, 'a_pos')
  gl.bindAttribLocation(program, 1, 'a_uv')
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  programCache.set(fragSource, program)
  return program
}

export interface ShaderUniforms {
  /** 256×1 RGBA8 LUT texture data (per-channel transfer curve in the R channel). */
  lut?: Uint8ClampedArray
  floats?: Record<string, number>
  ints?: Record<string, number>
}

/**
 * Run a fragment shader over `source`, returning the shared GL canvas with the
 * result rendered into it (size = width×height). Returns null if WebGL is
 * unavailable or any step fails — callers must fall back to CPU.
 *
 * The returned canvas is reused across calls; blit it immediately (e.g.
 * `ctx.drawImage`) before the next runShader call.
 */
export function runShader(
  fragSource: string,
  source: TexImageSource,
  width: number,
  height: number,
  uniforms: ShaderUniforms = {},
): HTMLCanvasElement | null {
  const state = initGL()
  if (!state || width <= 0 || height <= 0) return null
  const { canvas, gl } = state

  try {
    const program = getProgram(gl, fragSource)
    if (!program) return null

    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    gl.viewport(0, 0, width, height)

    gl.useProgram(program)

    // Quad attributes
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT)

    // Source image → texture unit 0
    const imageTex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, imageTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    const uImage = gl.getUniformLocation(program, 'u_image')
    if (uImage) gl.uniform1i(uImage, 0)

    // Optional LUT → texture unit 1
    let lutTex: WebGLTexture | null = null
    if (uniforms.lut) {
      lutTex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, lutTex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(uniforms.lut.buffer, uniforms.lut.byteOffset, uniforms.lut.byteLength),
      )
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      const uLut = gl.getUniformLocation(program, 'u_lut')
      if (uLut) gl.uniform1i(uLut, 1)
    }

    if (uniforms.floats) {
      for (const [name, value] of Object.entries(uniforms.floats)) {
        const loc = gl.getUniformLocation(program, name)
        if (loc) gl.uniform1f(loc, value)
      }
    }
    if (uniforms.ints) {
      for (const [name, value] of Object.entries(uniforms.ints)) {
        const loc = gl.getUniformLocation(program, name)
        if (loc) gl.uniform1i(loc, value)
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Clean up per-call textures (the program/buffer stay cached).
    gl.deleteTexture(imageTex)
    if (lutTex) gl.deleteTexture(lutTex)

    return canvas
  } catch {
    return null
  }
}

/** Test/inspection hook: reset cached state (used by unit tests). */
export function __resetGLForTests(): void {
  glState = undefined
  programCache.clear()
}
