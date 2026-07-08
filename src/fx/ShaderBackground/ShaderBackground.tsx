import { type Component, type JSX, splitProps, createEffect, onCleanup, onMount } from 'solid-js';
import './ShaderBackground.css';

export type ShaderPreset = 'noise' | 'gradient' | 'waves' | 'aurora';

export interface ShaderBackgroundProps {
  /** Shader preset */
  preset?: ShaderPreset;
  /** Primary color (CSS color) */
  color1?: string;
  /** Secondary color (CSS color) */
  color2?: string;
  /** Animation speed 0-1 */
  speed?: number;
  /** Intensity of the effect 0-1 */
  intensity?: number;
  /** Overlay content on top */
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Simplex noise helper included inline
const NOISE_FN = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const FRAGMENT_SHADERS: Record<ShaderPreset, string> = {
  noise: `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_intensity;
out vec4 fragColor;
${NOISE_FN}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  float n = snoise(uv * 3.0 + vec2(t * 0.3, t * 0.2));
  n = n * 0.5 + 0.5;
  n = mix(0.3, 1.0, n * u_intensity + (1.0 - u_intensity) * 0.5);
  vec3 col = mix(u_color1, u_color2, n);
  fragColor = vec4(col, 1.0);
}`,
  gradient: `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_intensity;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  float wave = sin(uv.x * 3.14159 + t) * 0.5 + 0.5;
  float wave2 = cos(uv.y * 3.14159 * 1.3 + t * 0.7) * 0.5 + 0.5;
  float blend = mix(wave, wave2, 0.5) * u_intensity + (1.0 - u_intensity) * 0.5;
  vec3 col = mix(u_color1, u_color2, blend);
  fragColor = vec4(col, 1.0);
}`,
  waves: `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_intensity;
out vec4 fragColor;
${NOISE_FN}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  float wave = sin((uv.x + snoise(vec2(uv.y * 2.0, t * 0.5)) * u_intensity * 0.4) * 6.2831 * 2.0 + t) * 0.5 + 0.5;
  float wave2 = sin((uv.x + 0.3 + snoise(vec2(uv.y * 1.5, t * 0.3)) * u_intensity * 0.3) * 6.2831 * 3.0 - t * 0.8) * 0.5 + 0.5;
  float blend = mix(wave, wave2, uv.y);
  vec3 col = mix(u_color1, u_color2, blend);
  fragColor = vec4(col, 1.0);
}`,
  aurora: `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_intensity;
out vec4 fragColor;
${NOISE_FN}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed * 0.5;
  float n1 = snoise(vec2(uv.x * 2.0 + t, uv.y * 1.5));
  float n2 = snoise(vec2(uv.x * 1.5 - t * 0.7, uv.y * 2.0 + t * 0.3));
  float band = smoothstep(0.3, 0.7, uv.y + n1 * u_intensity * 0.3)
             * smoothstep(1.0, 0.5, uv.y + n2 * u_intensity * 0.2);
  float glow = exp(-abs(uv.y - 0.55 - n1 * 0.1) * 6.0) * u_intensity;
  vec3 base = mix(u_color1 * 0.15, u_color2 * 0.15, uv.x);
  vec3 aurora = mix(u_color1, u_color2, n2 * 0.5 + 0.5);
  vec3 col = base + aurora * (band + glow);
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
};

function resolveCssColor(color: string, el: HTMLElement): [number, number, number] {
  // Check if it's a CSS custom property reference
  if (color.startsWith('var(')) {
    const varName = color.slice(4, -1).trim();
    const computed = getComputedStyle(el).getPropertyValue(varName).trim();
    return parseColor(computed || '#888888');
  }
  return parseColor(color);
}

function parseColor(color: string): [number, number, number] {
  // Handle hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    return [r, g, b];
  }
  // Handle rgb/rgba
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [
      parseInt(match[1] ?? '0') / 255,
      parseInt(match[2] ?? '0') / 255,
      parseInt(match[3] ?? '0') / 255,
    ];
  }
  return [0.5, 0.5, 0.5];
}

function createShaderProgram(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram | null {
  const vert = gl.createShader(gl.VERTEX_SHADER);
  const frag = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vert || !frag) return null;

  gl.shaderSource(vert, vertSrc);
  gl.compileShader(vert);
  if (!(gl.getShaderParameter(vert, gl.COMPILE_STATUS) as boolean)) {
    gl.deleteShader(vert);
    return null;
  }

  gl.shaderSource(frag, fragSrc);
  gl.compileShader(frag);
  if (!(gl.getShaderParameter(frag, gl.COMPILE_STATUS) as boolean)) {
    gl.deleteShader(frag);
    return null;
  }

  const program = gl.createProgram();
  if (program == null) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!(gl.getProgramParameter(program, gl.LINK_STATUS) as boolean)) {
    gl.deleteProgram(program);
    return null;
  }

  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
}

/**
 * ShaderBackground — WebGL fragment shader background with animated effects.
 *
 * @example
 * ```tsx
 * <ShaderBackground preset="aurora" speed={0.4}>
 *   <h1>Hello World</h1>
 * </ShaderBackground>
 * ```
 */
export const ShaderBackground: Component<ShaderBackgroundProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'preset',
    'color1',
    'color2',
    'speed',
    'intensity',
    'children',
    'class',
    'style',
  ]);

  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let rafId = 0;
  let glCtx: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let startTime = performance.now();

  const preset = () => local.preset ?? 'noise';
  const speed = () => local.speed ?? 0.3;
  const intensity = () => local.intensity ?? 0.5;
  const color1 = () => local.color1 ?? 'var(--sk-accent)';
  const color2 = () => local.color2 ?? 'var(--sk-info)';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMount(() => {
    if (!canvasRef || !containerRef) return;

    // Attempt WebGL2 then fallback to WebGL1
    glCtx =
      (canvasRef.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvasRef.getContext('webgl') as WebGLRenderingContext | null);

    if (!glCtx) {
      // CSS fallback: apply animated gradient class
      containerRef.classList.add('sk-shader-bg--css-fallback');
      return;
    }

    const gl = glCtx;
    const fragSrc = FRAGMENT_SHADERS[preset()];

    // WebGL1 needs #version 300 es removed and out → gl_FragColor
    const isWebGL1 = !(gl instanceof WebGL2RenderingContext);
    const vertSrc = isWebGL1
      ? VERTEX_SHADER.replace('#version 300 es\n', '').replace(
          'in vec2 a_position;',
          'attribute vec2 a_position;'
        )
      : VERTEX_SHADER;

    const adaptedFrag = isWebGL1
      ? fragSrc
          .replace('#version 300 es\n', '')
          .replace('out vec4 fragColor;', '')
          .replace('fragColor', 'gl_FragColor')
      : fragSrc;

    program = createShaderProgram(gl, vertSrc, adaptedFrag);
    if (program == null) {
      containerRef?.classList.add('sk-shader-bg--css-fallback');
      return;
    }

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uColor1 = gl.getUniformLocation(program, 'u_color1');
    const uColor2 = gl.getUniformLocation(program, 'u_color2');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');

    const render = () => {
      if (glCtx == null || program == null || canvasRef == null || containerRef == null) return;

      const { width, height } = containerRef.getBoundingClientRect();
      canvasRef.width = width !== 0 ? width : 400;
      canvasRef.height = height !== 0 ? height : 300;
      gl.viewport(0, 0, canvasRef.width, canvasRef.height);

      const elapsed = (performance.now() - startTime) / 1000;
      const c1 = resolveCssColor(color1(), containerRef);
      const c2 = resolveCssColor(color2(), containerRef);

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvasRef.width, canvasRef.height);
      gl.uniform3fv(uColor1, c1);
      gl.uniform3fv(uColor2, c2);
      gl.uniform1f(uSpeed, speed());
      gl.uniform1f(uIntensity, intensity());

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();
  });

  // Re-initialize on preset change
  createEffect(() => {
    const _p = preset();
    // Cleanup and re-init handled by reactivity — for simplicity restart time
    startTime = performance.now();
  });

  onCleanup(() => {
    if (rafId !== 0) cancelAnimationFrame(rafId);
    if (glCtx != null && program != null) {
      glCtx.deleteProgram(program);
    }
  });

  const classes = () => ['sk-shader-bg', local.class].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} class={classes()} style={local.style} {...rest}>
      <canvas ref={canvasRef} class="sk-shader-bg__canvas" aria-hidden="true" />
      {local.children != null && <div class="sk-shader-bg__content">{local.children}</div>}
    </div>
  );
};
