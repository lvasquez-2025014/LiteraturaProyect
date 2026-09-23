import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  NgZone,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type GradientWavesDetail = 'low' | 'medium' | 'high';

const VERTEX_SHADER_SRC = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

@Component({
  selector: 'app-gradient-waves',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gradient-waves-wrapper" #container>
      <canvas #canvas class="gradient-waves-canvas"></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }

      .gradient-waves-wrapper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }

      .gradient-waves-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class GradientWavesComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() horizonColor: string = '#5227FF';
  @Input() waveColor: string = '#FF9FFC';
  @Input() crestColor: string = '#FFFFFF';
  @Input() speed: number = 0.4;
  @Input() amplitude: number = 2.5;
  @Input() waveScale: number = 0.6;
  @Input() waveRatio: number = 0.9;
  @Input() swell: number = 35;
  @Input() turbulence: number = 20;
  @Input() tilt: number = 1.11;
  @Input() zoom: number = 1.0;
  @Input() height: number = 5.5;
  @Input() fogDepth: number = 15;
  @Input() detail: GradientWavesDetail = 'medium';
  @Input() brightness: number = 1.0;
  @Input() opacity: number = 1.0;
  @Input() mouseInteraction: boolean = true;
  @Input() parallaxStrength: number = 0.5;
  @Input() grain: boolean = true;
  @Input() grainIntensity: number = 0.05;

  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private rafId: number = 0;
  private isDestroyed = false;
  private isVisible = true;
  private isPageVisible = true;

  private t0: number = 0;
  private lastRenderTime: number = 0;
  private currentMouse: [number, number] = [0.5, 0.5];
  private targetMouse: [number, number] = [0.5, 0.5];

  // Uniform locations
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uSpeedLoc: WebGLUniformLocation | null = null;
  private uAmplitudeLoc: WebGLUniformLocation | null = null;
  private uWaveScaleLoc: WebGLUniformLocation | null = null;
  private uWaveRatioLoc: WebGLUniformLocation | null = null;
  private uSwellLoc: WebGLUniformLocation | null = null;
  private uTurbulenceLoc: WebGLUniformLocation | null = null;
  private uTiltLoc: WebGLUniformLocation | null = null;
  private uZoomLoc: WebGLUniformLocation | null = null;
  private uHeightLoc: WebGLUniformLocation | null = null;
  private uFogDepthLoc: WebGLUniformLocation | null = null;
  private uStepsLoc: WebGLUniformLocation | null = null;
  private uBrightnessLoc: WebGLUniformLocation | null = null;
  private uOpacityLoc: WebGLUniformLocation | null = null;
  private uGrainLoc: WebGLUniformLocation | null = null;
  private uGrainIntensityLoc: WebGLUniformLocation | null = null;
  private uMouseLoc: WebGLUniformLocation | null = null;
  private uParallaxLoc: WebGLUniformLocation | null = null;
  private uEnableMouseLoc: WebGLUniformLocation | null = null;
  private uHorizonColorLoc: WebGLUniformLocation | null = null;
  private uWaveColorLoc: WebGLUniformLocation | null = null;
  private uCrestColorLoc: WebGLUniformLocation | null = null;

  ngOnInit(): void {
    this.t0 = performance.now();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initWebGL();
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('pointermove', this.onPointerMove);

    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.program) this.gl.deleteProgram(this.program);
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }

  private detailToSteps(detail: GradientWavesDetail): number {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) return 26.0;
    if (detail === 'low') return 30.0;
    if (detail === 'high') return 58.0;
    return 40.0;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [1, 1, 1];
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
  }

  private initWebGL(): void {
    const canvas = this.canvasRef.nativeElement;
    this.gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!this.gl) {
      console.warn('WebGL2 no está disponible en este dispositivo para GradientWaves.');
      return;
    }

    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);

    const vertShader = this.createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = this.createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vertShader || !fragShader) return;

    this.program = gl.createProgram();
    if (!this.program) return;

    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Error al enlazar programa WebGL GradientWaves:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Fullscreen single triangle covering clip space
    const positions = new Float32Array([
      -1, -1,
       3, -1,
      -1,  3,
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posAttrLoc = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posAttrLoc);
    gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache uniforms
    this.uResolutionLoc = gl.getUniformLocation(this.program, 'iResolution');
    this.uTimeLoc = gl.getUniformLocation(this.program, 'iTime');
    this.uSpeedLoc = gl.getUniformLocation(this.program, 'uSpeed');
    this.uAmplitudeLoc = gl.getUniformLocation(this.program, 'uAmplitude');
    this.uWaveScaleLoc = gl.getUniformLocation(this.program, 'uWaveScale');
    this.uWaveRatioLoc = gl.getUniformLocation(this.program, 'uWaveRatio');
    this.uSwellLoc = gl.getUniformLocation(this.program, 'uSwell');
    this.uTurbulenceLoc = gl.getUniformLocation(this.program, 'uTurbulence');
    this.uTiltLoc = gl.getUniformLocation(this.program, 'uTilt');
    this.uZoomLoc = gl.getUniformLocation(this.program, 'uZoom');
    this.uHeightLoc = gl.getUniformLocation(this.program, 'uHeight');
    this.uFogDepthLoc = gl.getUniformLocation(this.program, 'uFogDepth');
    this.uStepsLoc = gl.getUniformLocation(this.program, 'uSteps');
    this.uBrightnessLoc = gl.getUniformLocation(this.program, 'uBrightness');
    this.uOpacityLoc = gl.getUniformLocation(this.program, 'uOpacity');
    this.uGrainLoc = gl.getUniformLocation(this.program, 'uGrain');
    this.uGrainIntensityLoc = gl.getUniformLocation(this.program, 'uGrainIntensity');
    this.uMouseLoc = gl.getUniformLocation(this.program, 'uMouse');
    this.uParallaxLoc = gl.getUniformLocation(this.program, 'uParallax');
    this.uEnableMouseLoc = gl.getUniformLocation(this.program, 'uEnableMouse');
    this.uHorizonColorLoc = gl.getUniformLocation(this.program, 'uHorizonColor');
    this.uWaveColorLoc = gl.getUniformLocation(this.program, 'uWaveColor');
    this.uCrestColorLoc = gl.getUniformLocation(this.program, 'uCrestColor');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.resizeCanvas();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      this.resizeObserver.observe(this.containerRef.nativeElement);
    } else {
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.isVisible = entry.isIntersecting;
        this.toggleLoop();
      }, { threshold: 0 });
      this.intersectionObserver.observe(this.containerRef.nativeElement);
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });

    this.toggleLoop();
  }

  private createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error al compilar shader GradientWaves:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private resizeCanvas(): void {
    if (!this.gl || !this.canvasRef || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // En móviles renderizamos a 0.55x (el reescalado bilineal nativo por GPU mantiene las olas suaves e idénticas con 75% menos píxeles)
    // En ordenadores limitamos a 1.0x para evitar saturar pantallas 2K/4K
    const dpr = isMobile ? 0.55 : Math.min(window.devicePixelRatio || 1, 1.0);
    const width = Math.max(1, Math.floor(container.clientWidth * dpr));
    const height = Math.max(1, Math.floor(container.clientHeight * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.mouseInteraction || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.targetMouse[0] = (e.clientX - rect.left) / rect.width;
    this.targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
  };

  private onVisibilityChange = (): void => {
    this.isPageVisible = !document.hidden;
    this.toggleLoop();
  };

  private toggleLoop(): void {
    const shouldRun = !this.isDestroyed && this.isVisible && this.isPageVisible;
    if (shouldRun && !this.rafId) {
      this.renderLoop();
    } else if (!shouldRun && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private renderLoop = (): void => {
    if (this.isDestroyed || !this.gl || !this.program) return;

    const now = performance.now();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    // 30 FPS en celulares para fluidez total sin recalentar GPU; 60 FPS en computadoras
    const minInterval = isMobile ? 1000 / 30 : 1000 / 60;

    if (now - this.lastRenderTime < minInterval) {
      this.rafId = requestAnimationFrame(this.renderLoop);
      return;
    }
    this.lastRenderTime = now;

    const gl = this.gl;
    const canvas = this.canvasRef.nativeElement;
    const elapsedTime = (now - this.t0) * 0.001;

    // Smooth mouse lerp
    const tx = (!isMobile && this.mouseInteraction) ? this.targetMouse[0] : 0.5;
    const ty = (!isMobile && this.mouseInteraction) ? this.targetMouse[1] : 0.5;
    this.currentMouse[0] += 0.05 * (tx - this.currentMouse[0]);
    this.currentMouse[1] += 0.05 * (ty - this.currentMouse[1]);

    gl.useProgram(this.program);

    gl.uniform2f(this.uResolutionLoc, canvas.width, canvas.height);
    gl.uniform1f(this.uTimeLoc, elapsedTime);
    gl.uniform1f(this.uSpeedLoc, this.speed);
    gl.uniform1f(this.uAmplitudeLoc, this.amplitude);
    gl.uniform1f(this.uWaveScaleLoc, this.waveScale);
    gl.uniform1f(this.uWaveRatioLoc, this.waveRatio);
    gl.uniform1f(this.uSwellLoc, this.swell);
    gl.uniform1f(this.uTurbulenceLoc, this.turbulence);
    gl.uniform1f(this.uTiltLoc, this.tilt);
    gl.uniform1f(this.uZoomLoc, this.zoom);
    gl.uniform1f(this.uHeightLoc, this.height);
    gl.uniform1f(this.uFogDepthLoc, this.fogDepth);
    gl.uniform1f(this.uStepsLoc, this.detailToSteps(this.detail));
    gl.uniform1f(this.uBrightnessLoc, this.brightness);
    gl.uniform1f(this.uOpacityLoc, this.opacity);
    gl.uniform1f(this.uGrainLoc, isMobile ? 0.0 : (this.grain ? 1.0 : 0.0));
    gl.uniform1f(this.uGrainIntensityLoc, this.grainIntensity);
    gl.uniform2f(this.uMouseLoc, this.currentMouse[0], this.currentMouse[1]);
    gl.uniform1f(this.uParallaxLoc, isMobile ? 0.0 : this.parallaxStrength);
    gl.uniform1i(this.uEnableMouseLoc, (!isMobile && this.mouseInteraction) ? 1 : 0);

    const [hr, hg, hb] = this.hexToRgb(this.horizonColor);
    gl.uniform3f(this.uHorizonColorLoc, hr, hg, hb);

    const [wr, wg, wb] = this.hexToRgb(this.waveColor);
    gl.uniform3f(this.uWaveColorLoc, wr, wg, wb);

    const [cr, cg, cb] = this.hexToRgb(this.crestColor);
    gl.uniform3f(this.uCrestColorLoc, cr, cg, cb);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.rafId = requestAnimationFrame(this.renderLoop);
  };
}
