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
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-velocity',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-velocity-parallax" [class]="parallaxClassName" #container>
      <div class="scroll-velocity-scroller" #scroller>
        <div
          *ngFor="let copy of copies; let first = first"
          class="velocity-item"
          [attr.data-first]="first ? 'true' : null"
        >
          <span [class]="className" class="velocity-text">
            {{ text }}
          </span>
          <!-- Espaciador amplio para garantizar que solo se vea UNA frase a la vez sin repetición contigua -->
          <span class="velocity-spacer" #spacer aria-hidden="true"></span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        contain: paint;
      }

      .scroll-velocity-parallax {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 100%;
        padding: 6px 0;
        mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
      }

      .scroll-velocity-scroller {
        display: flex;
        white-space: nowrap;
        width: max-content;
        will-change: transform;
      }

      .velocity-item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }

      .velocity-text {
        flex-shrink: 0;
        white-space: nowrap;
        display: inline-block;
      }

      .velocity-spacer {
        display: inline-block;
        flex-shrink: 0;
        width: 480px;
        min-width: 320px;
      }

      @media (max-width: 768px) {
        .scroll-velocity-parallax {
          mask-image: none;
          -webkit-mask-image: none;
          padding: 2px 0;
        }

        .scroll-velocity-scroller {
          display: flex;
          justify-content: center;
          width: 100% !important;
          transform: none !important;
          white-space: normal;
        }

        .velocity-item {
          display: none;
        }

        .velocity-item[data-first="true"] {
          display: block;
          text-align: center;
          width: 100%;
        }

        .velocity-text {
          white-space: normal;
          text-align: center;
          display: block;
          width: 100%;
        }

        .velocity-spacer {
          display: none !important;
        }
      }
    `,
  ],
})
export class ScrollVelocityComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);

  @ViewChild('container') containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('scroller') scrollerRef?: ElementRef<HTMLDivElement>;

  @Input() text: string = 'Lee, aprende y avanza hacia el éxito.';
  @Input() velocity: number = 65;
  @Input() className: string = '';
  @Input() damping: number = 50;
  @Input() stiffness: number = 400;
  @Input() parallaxClassName: string = '';

  copies = [0, 1, 2, 3];

  private rafId: number = 0;
  private isDestroyed = false;
  private baseX = 0;
  private copyWidth = 0;
  private lastTime = 0;

  private scrollVelocity = 0;
  private smoothVelocity = 0;
  private lastScrollY = 0;
  private directionFactor = -1; // Desplazamiento natural de derecha a izquierda

  ngOnInit(): void {
    this.lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initScroller();
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);
  }

  private onScroll = (): void => {
    const currentY = window.scrollY;
    const delta = currentY - this.lastScrollY;
    this.scrollVelocity += delta * 2.5;
    this.lastScrollY = currentY;
  };

  private onWheel = (e: WheelEvent): void => {
    this.scrollVelocity += e.deltaY * 0.8;
  };

  private onResize = (): void => {
    this.calculateWidth();
  };

  private calculateWidth(): void {
    if (!this.scrollerRef || !this.containerRef) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const containerWidth = this.containerRef.nativeElement.clientWidth || 500;

    // Ajustar el espaciador al ancho del contenedor para que la siguiente copia espere hasta que la primera salga
    const spacers = this.scrollerRef.nativeElement.querySelectorAll('.velocity-spacer') as NodeListOf<HTMLElement>;
    spacers.forEach((s) => {
      s.style.width = isMobile ? '0px' : `${Math.max(containerWidth + 40, 320)}px`;
    });

    const firstItem = this.scrollerRef.nativeElement.querySelector(
      '.velocity-item[data-first="true"]'
    ) as HTMLElement;
    if (firstItem) {
      this.copyWidth = firstItem.offsetWidth;
    }
  }

  private wrap(min: number, max: number, v: number): number {
    const range = max - min;
    if (range <= 0) return 0;
    return ((((v - min) % range) + range) % range) + min;
  }

  private initScroller(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    this.calculateWidth();
    if (document.fonts) {
      document.fonts.ready.then(() => this.calculateWidth());
    }

    this.lastTime = performance.now();
    this.renderLoop();
  }

  private renderLoop = (): void => {
    if (this.isDestroyed) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      // En móviles el texto se presenta fijo y centrado; ahorramos 100% de CPU de este bucle
      this.rafId = setTimeout(() => {
        if (!this.isDestroyed) this.renderLoop();
      }, 600) as any;
      return;
    }

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) * 0.001, 0.1);
    this.lastTime = now;

    if (!this.copyWidth) {
      this.calculateWidth();
    }

    // Física de resorte con damping y stiffness (interpolación suave)
    const springFactor = Math.min(1, delta * (this.stiffness / Math.max(1, this.damping)));
    this.smoothVelocity += (this.scrollVelocity - this.smoothVelocity) * springFactor;
    this.scrollVelocity *= Math.pow(0.85, delta * 60);

    const velocityFactor = (this.smoothVelocity / 1000) * 5;
    if (velocityFactor < -0.05) {
      this.directionFactor = 1;
    } else if (velocityFactor > 0.05) {
      this.directionFactor = -1;
    }

    let moveBy = this.directionFactor * this.velocity * delta;
    moveBy += this.directionFactor * (this.velocity * delta) * Math.abs(velocityFactor);

    this.baseX += moveBy;

    if (this.scrollerRef && this.copyWidth > 0) {
      const wrappedX = this.wrap(-this.copyWidth, 0, this.baseX);
      this.scrollerRef.nativeElement.style.transform = `translate3d(${wrappedX}px, 0, 0)`;
    }

    this.rafId = requestAnimationFrame(this.renderLoop);
  };
}
