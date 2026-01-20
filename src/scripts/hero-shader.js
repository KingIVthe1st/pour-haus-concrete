/**
 * WebGL Hero Shader Module
 * Awwwards-grade visual effect with noise displacement
 *
 * Features:
 * - Subtle noise displacement on hero background
 * - Scroll-reactive distortion
 * - Mouse-following ripple effect
 * - GPU-accelerated via WebGL
 * - Graceful fallback if WebGL unavailable
 * - Respects reduced motion preference
 */

/**
 * Initialize WebGL shader effect on hero section
 * @param {Lenis} lenis - Lenis instance for scroll position
 */
export function initHeroShader(lenis) {
  // Skip if reduced motion preferred
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const hero = document.getElementById("hero");
  if (!hero) return null;

  // Check WebGL support
  const testCanvas = document.createElement("canvas");
  const gl =
    testCanvas.getContext("webgl") ||
    testCanvas.getContext("experimental-webgl");
  if (!gl) {
    console.log("WebGL not supported, skipping hero shader");
    return null;
  }

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.className = "hero-shader-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.4;
    mix-blend-mode: overlay;
    z-index: 1;
  `;

  // Insert canvas as first child of hero
  hero.style.position = "relative";
  hero.insertBefore(canvas, hero.firstChild);

  // Initialize WebGL context
  const glContext = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: false,
  });

  if (!glContext) {
    canvas.remove();
    return null;
  }

  // Shader sources
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;

    varying vec2 v_texCoord;

    uniform float u_time;
    uniform float u_scroll;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;

    // Simplex noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                      + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                              dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 pixel = gl_FragCoord.xy / u_resolution;

      // Time-based animation
      float t = u_time * 0.0003;

      // Scroll-based offset
      float scrollOffset = u_scroll * 0.0002;

      // Mouse influence (subtle ripple)
      vec2 mousePos = u_mouse / u_resolution;
      float mouseDist = distance(pixel, mousePos);
      float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.02;

      // Layer 1: Large slow noise
      float n1 = snoise(uv * 2.0 + t * 0.5 + scrollOffset);

      // Layer 2: Medium noise
      float n2 = snoise(uv * 4.0 - t * 0.3 + scrollOffset * 1.5);

      // Layer 3: Fine detail noise
      float n3 = snoise(uv * 8.0 + t * 0.8);

      // Combine layers
      float noise = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;
      noise = noise * 0.5 + 0.5; // Normalize to 0-1

      // Add mouse ripple
      noise += mouseInfluence * sin(mouseDist * 20.0 - u_time * 0.005);

      // Color output - subtle concrete/clay tint
      vec3 color = vec3(noise);
      color = mix(color, vec3(0.6, 0.5, 0.4), 0.1); // Slight warm tint

      // Fade at edges
      float edgeFade = smoothstep(0.0, 0.1, uv.x) *
                       smoothstep(1.0, 0.9, uv.x) *
                       smoothstep(0.0, 0.1, uv.y) *
                       smoothstep(1.0, 0.9, uv.y);

      gl_FragColor = vec4(color, noise * edgeFade * 0.5);
    }
  `;

  // Compile shaders
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(
    glContext,
    glContext.VERTEX_SHADER,
    vertexShaderSource,
  );
  const fragmentShader = createShader(
    glContext,
    glContext.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  if (!vertexShader || !fragmentShader) {
    canvas.remove();
    return null;
  }

  // Create program
  const program = glContext.createProgram();
  glContext.attachShader(program, vertexShader);
  glContext.attachShader(program, fragmentShader);
  glContext.linkProgram(program);

  if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
    console.error("Program link error:", glContext.getProgramInfoLog(program));
    canvas.remove();
    return null;
  }

  glContext.useProgram(program);

  // Set up geometry (full-screen quad)
  const positions = new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
  ]);
  const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

  const positionBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    positions,
    glContext.STATIC_DRAW,
  );

  const positionLocation = glContext.getAttribLocation(program, "a_position");
  glContext.enableVertexAttribArray(positionLocation);
  glContext.vertexAttribPointer(
    positionLocation,
    2,
    glContext.FLOAT,
    false,
    0,
    0,
  );

  const texCoordBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, texCoordBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    texCoords,
    glContext.STATIC_DRAW,
  );

  const texCoordLocation = glContext.getAttribLocation(program, "a_texCoord");
  glContext.enableVertexAttribArray(texCoordLocation);
  glContext.vertexAttribPointer(
    texCoordLocation,
    2,
    glContext.FLOAT,
    false,
    0,
    0,
  );

  // Get uniform locations
  const uniforms = {
    time: glContext.getUniformLocation(program, "u_time"),
    scroll: glContext.getUniformLocation(program, "u_scroll"),
    mouse: glContext.getUniformLocation(program, "u_mouse"),
    resolution: glContext.getUniformLocation(program, "u_resolution"),
  };

  // State
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let rafId = null;
  let isVisible = true;
  let startTime = Date.now();

  // Resize handler
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    glContext.viewport(0, 0, canvas.width, canvas.height);
    glContext.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  }

  // Mouse tracking
  function handleMouseMove(e) {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * Math.min(window.devicePixelRatio, 2);
    mouseY =
      (rect.height - (e.clientY - rect.top)) *
      Math.min(window.devicePixelRatio, 2);
  }

  // Scroll tracking
  if (lenis) {
    lenis.on("scroll", ({ scroll }) => {
      scrollY = scroll;
    });
  }

  // Render loop
  function render() {
    if (!isVisible) {
      rafId = requestAnimationFrame(render);
      return;
    }

    const time = Date.now() - startTime;

    glContext.uniform1f(uniforms.time, time);
    glContext.uniform1f(uniforms.scroll, scrollY);
    glContext.uniform2f(uniforms.mouse, mouseX, mouseY);

    glContext.clearColor(0, 0, 0, 0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);
    glContext.drawArrays(glContext.TRIANGLES, 0, 6);

    rafId = requestAnimationFrame(render);
  }

  // Visibility handling
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
  });

  // Initialize
  resize();
  window.addEventListener("resize", resize);
  hero.addEventListener("mousemove", handleMouseMove);
  render();

  // Return cleanup function
  return function cleanup() {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    hero.removeEventListener("mousemove", handleMouseMove);
    canvas.remove();
  };
}
