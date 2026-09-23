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
import { gsap } from 'gsap';

interface Peep {
  image: HTMLImageElement;
  rect: number[];
  baseWidth: number;
  baseHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: any;
  setRect: (rect: number[]) => void;
  updateScale: (scale: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

@Component({
  selector: 'app-crowd-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crowd-canvas-wrapper" [class.inverted]="inverted">
      <canvas #canvas class="crowd-canvas"></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
        z-index: 1;
      }

      .crowd-canvas-wrapper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
      }

      .crowd-canvas {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
      }

      /* Inversión opcional solo si se usa en fondos oscuros */
      .crowd-canvas-wrapper.inverted .crowd-canvas {
        filter: invert(1) brightness(1.15) drop-shadow(0 4px 14px rgba(0, 74, 173, 0.35));
        opacity: 0.78;
      }
    `,
  ],
})
export class CrowdCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() src: string = '/openpeeps-crowd.png';
  @Input() rows: number = 15;
  @Input() cols: number = 7;
  @Input() inverted: boolean = true;
  @Input() maxPeeps?: number;

  private ctx: CanvasRenderingContext2D | null = null;
  private img: HTMLImageElement | null = null;
  private resizeObserver?: ResizeObserver;
  private renderCallback?: () => void;

  private allPeeps: Peep[] = [];
  private availablePeeps: Peep[] = [];
  private crowd: Peep[] = [];

  private stage = {
    width: 0,
    height: 0,
    scale: 0.85,
  };

  private lastRenderTime = 0;
  private isDestroyed = false;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.ngZone.runOutsideAngular(() => {
      this.initCanvasEngine();
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.renderCallback) {
      gsap.ticker.remove(this.renderCallback);
    }

    this.crowd.forEach((peep) => {
      if (peep.walk) {
        peep.walk.kill();
      }
    });

    this.crowd = [];
    this.availablePeeps = [];
    this.allPeeps = [];
  }

  private initCanvasEngine(): void {
    const canvas = this.canvasRef.nativeElement;
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';

    this.img.onload = () => {
      if (this.isDestroyed) return;
      this.createPeeps();
      this.resize();

      this.renderCallback = () => this.render();
      gsap.ticker.add(this.renderCallback);

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.resize();
        });
        if (canvas.parentElement) {
          this.resizeObserver.observe(canvas.parentElement);
        }
      } else {
        window.addEventListener('resize', this.onWindowResize);
      }
    };

    this.img.onerror = () => {
      console.warn('Cargando spritesheet alternativo de respaldo...');
      if (
        this.img &&
        this.src !== 'https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png'
      ) {
        this.img.src =
          'https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png';
      }
    };

    this.img.src = this.src;
  }

  private onWindowResize = () => {
    this.resize();
  };

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private randomIndex(array: any[]): number {
    return (this.randomRange(0, array.length) | 0);
  }

  private removeFromArray(array: any[], i: number): any {
    return array.splice(i, 1)[0];
  }

  private removeItemFromArray(array: any[], item: any): any {
    return this.removeFromArray(array, array.indexOf(item));
  }

  private removeRandomFromArray(array: any[]): any {
    return this.removeFromArray(array, this.randomIndex(array));
  }

  private getRandomFromArray(array: any[]): any {
    return array[this.randomIndex(array) | 0];
  }

  private calculateScale(width: number): number {
    if (width < 640) return 0.49;
    if (width < 1024) return 0.68;
    if (width < 1440) return 0.82;
    return 0.92;
  }

  private resetPeep(stage: { width: number; height: number; scale: number }, peep: Peep) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    // Alineación precisa y estricta en el piso inferior de la pantalla
    const offsetY = (2 - 8 * Math.random()) * stage.scale;
    const startY = stage.height - peep.height + offsetY;
    let startX: number;
    let endX: number;

    if (direction === 1) {
      startX = -peep.width;
      endX = stage.width;
      peep.scaleX = 1;
    } else {
      startX = stage.width + peep.width;
      endX = 0;
      peep.scaleX = -1;
    }

    peep.x = startX;
    peep.y = startY;
    peep.anchorY = startY;

    return {
      startX,
      startY,
      endX,
    };
  }

  private normalWalk(peep: Peep, props: { startX: number; startY: number; endX: number }) {
    const { startX, startY, endX } = props;
    const xDuration = 10;
    const yDuration = 0.25;

    const tl = gsap.timeline();
    tl.timeScale(this.randomRange(0.6, 1.4));
    tl.to(
      peep,
      {
        duration: xDuration,
        x: endX,
        ease: 'none',
      },
      0
    );
    tl.to(
      peep,
      {
        duration: yDuration,
        repeat: Math.floor(xDuration / yDuration),
        yoyo: true,
        y: startY - 8 * this.stage.scale,
      },
      0
    );

    return tl;
  }

  private createPeep(image: HTMLImageElement, rect: number[]): Peep {
    const baseW = rect[2];
    const baseH = rect[3];

    const peep: Peep = {
      image,
      rect: [],
      baseWidth: baseW,
      baseHeight: baseH,
      width: baseW,
      height: baseH,
      x: 0,
      y: 0,
      anchorY: 0,
      scaleX: 1,
      walk: null,
      setRect: (r: number[]) => {
        peep.rect = r;
      },
      updateScale: (scale: number) => {
        peep.width = peep.baseWidth * scale;
        peep.height = peep.baseHeight * scale;
      },
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.translate(peep.x, peep.y);
        ctx.scale(peep.scaleX, 1);
        ctx.drawImage(
          peep.image,
          peep.rect[0],
          peep.rect[1],
          peep.rect[2],
          peep.rect[3],
          0,
          0,
          peep.width,
          peep.height
        );
        ctx.restore();
      },
    };

    peep.setRect(rect);
    return peep;
  }

  private createPeeps(): void {
    if (!this.img) return;
    const { rows, cols } = this;
    const { naturalWidth: width, naturalHeight: height } = this.img;
    const total = rows * cols;
    const rectWidth = width / rows;
    const rectHeight = height / cols;

    this.allPeeps = [];
    for (let i = 0; i < total; i++) {
      this.allPeeps.push(
        this.createPeep(this.img, [
          (i % rows) * rectWidth,
          ((i / rows) | 0) * rectHeight,
          rectWidth,
          rectHeight,
        ])
      );
    }
  }

  private initCrowd(): void {
    const isMobile = this.stage.width < 640;
    // 4 personajes en móviles para una base limpia y ligera; 12 en tablet; 18 en desktop
    const defaultDensity = isMobile ? 4 : (this.stage.width < 1024 ? 12 : 18);
    const limit = this.maxPeeps ?? Math.min(this.availablePeeps.length, defaultDensity);

    while (this.availablePeeps.length && this.crowd.length < limit) {
      const p = this.addPeepToCrowd();
      if (p && p.walk) {
        p.walk.progress(Math.random());
      }
    }
  }

  private addPeepToCrowd(): Peep | null {
    if (!this.availablePeeps.length) return null;

    const peep = this.removeRandomFromArray(this.availablePeeps);
    peep.updateScale(this.stage.scale);
    const props = this.resetPeep(this.stage, peep);
    const walk = this.normalWalk(peep, props);

    walk.eventCallback('onComplete', () => {
      this.removePeepFromCrowd(peep);
      this.addPeepToCrowd();
    });

    peep.walk = walk;
    this.crowd.push(peep);
    this.crowd.sort((a, b) => a.anchorY - b.anchorY);

    return peep;
  }

  private removePeepFromCrowd(peep: Peep): void {
    this.removeItemFromArray(this.crowd, peep);
    this.availablePeeps.push(peep);
  }

  private render(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx || !canvas) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const now = performance.now();
    // Throttle a 30 FPS en pantallas móviles
    if (isMobile && now - this.lastRenderTime < 1000 / 30) {
      return;
    }
    this.lastRenderTime = now;

    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.scale(dpr, dpr);

    this.crowd.forEach((peep) => {
      peep.render(this.ctx!);
    });

    this.ctx.restore();
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;

    const parent = canvas.parentElement || canvas;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    this.stage.width = parent.clientWidth || window.innerWidth;
    this.stage.height = parent.clientHeight || window.innerHeight;
    this.stage.scale = this.calculateScale(this.stage.width);

    canvas.width = this.stage.width * dpr;
    canvas.height = this.stage.height * dpr;

    this.crowd.forEach((peep) => {
      if (peep.walk) {
        peep.walk.kill();
      }
    });

    this.crowd.length = 0;
    this.availablePeeps.length = 0;

    this.allPeeps.forEach((p) => {
      p.updateScale(this.stage.scale);
    });

    this.availablePeeps.push(...this.allPeeps);

    this.initCrowd();
  }
}
