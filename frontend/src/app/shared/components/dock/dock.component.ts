import {
  Component,
  Input,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  NgZone,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  OnChanges,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface DockItemConfig {
  id?: string;
  label: string;
  icon?: string;
  route?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  badge?: string | number;
}

export interface DockSpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
}

interface ItemState {
  size: number;
  targetSize: number;
  velocity: number;
}

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() items: DockItemConfig[] = [];
  @Input() className = '';
  @Input() spring: DockSpringConfig = { mass: 0.1, stiffness: 160, damping: 22 };
  @Input() magnification = 50;
  @Input() distance = 110;
  @Input() panelHeight = 44;
  @Input() dockHeight = 256;
  @Input() baseItemSize = 36;
  @Input() layout: 'inline' | 'floating' = 'inline';
  @Input() labelPosition: 'top' | 'bottom' | 'auto' = 'auto';
  @Input() theme: 'auto' | 'light' | 'dark' | 'glass' = 'auto';
  @Input() ariaLabel = 'Application dock';

  @ViewChild('panelRef') panelRef!: ElementRef<HTMLElement>;
  @ViewChildren('dockItemRef') itemRefs!: QueryList<ElementRef<HTMLElement>>;

  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  mouseX = Infinity;
  isHovered = false;
  hoveredIndex: number | null = null;
  itemStates: ItemState[] = [];

  private rafId: number | null = null;
  private lastTime = 0;
  private isDestroyed = false;
  private svgCache = new Map<string, SafeHtml>();

  ngOnInit(): void {
    this.syncItemStates();
  }

  ngAfterViewInit(): void {
    this.syncItemStates();
  }

  ngOnChanges(): void {
    this.syncItemStates();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private syncItemStates(): void {
    while (this.itemStates.length < this.items.length) {
      this.itemStates.push({
        size: this.baseItemSize,
        targetSize: this.baseItemSize,
        velocity: 0,
      });
    }
    while (this.itemStates.length > this.items.length) {
      this.itemStates.pop();
    }
  }

  getSafeSvg(iconSvg?: string): SafeHtml {
    if (!iconSvg) return '';
    let cached = this.svgCache.get(iconSvg);
    if (!cached) {
      cached = this.sanitizer.bypassSecurityTrustHtml(iconSvg);
      this.svgCache.set(iconSvg, cached);
    }
    return cached;
  }

  get resolvedLabelPosition(): 'top' | 'bottom' {
    if (this.labelPosition !== 'auto') {
      return this.labelPosition;
    }
    return this.layout === 'inline' ? 'bottom' : 'top';
  }

  isItemActive(item: DockItemConfig): boolean {
    if (typeof item.active === 'boolean') {
      return item.active;
    }
    if (item.route) {
      return this.router.isActive(item.route, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    }
    return false;
  }

  onPanelMouseMove(event: MouseEvent): void {
    this.isHovered = true;
    this.mouseX = event.clientX;
    this.startAnimationLoop();
  }

  onPanelMouseLeave(): void {
    this.isHovered = false;
    this.hoveredIndex = null;
    this.mouseX = Infinity;
    for (const state of this.itemStates) {
      state.targetSize = this.baseItemSize;
    }
    this.startAnimationLoop();
    this.cdr.markForCheck();
  }

  onItemMouseEnter(index: number): void {
    this.hoveredIndex = index;
    this.cdr.markForCheck();
  }

  onItemMouseLeave(index: number): void {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
    this.cdr.markForCheck();
  }

  onItemFocus(index: number): void {
    this.hoveredIndex = index;
    if (this.itemStates[index]) {
      this.itemStates[index].targetSize = this.magnification;
      this.startAnimationLoop();
      this.cdr.markForCheck();
    }
  }

  onItemBlur(index: number): void {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
    if (this.itemStates[index]) {
      this.itemStates[index].targetSize = this.baseItemSize;
      this.startAnimationLoop();
      this.cdr.markForCheck();
    }
  }

  onItemClick(item: DockItemConfig, event: Event): void {
    this.hoveredIndex = null;
    this.cdr.markForCheck();

    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    } else if (item.route) {
      // Navegación nativa con router
      this.router.navigateByUrl(item.route);
    }
  }

  onItemKeyDown(event: KeyboardEvent, item: DockItemConfig): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item, event);
    }
  }

  private startAnimationLoop(): void {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(this.renderLoop);
    });
  }

  private renderLoop = (now: number): void => {
    if (this.isDestroyed) {
      this.rafId = null;
      return;
    }

    const dt = Math.min((now - this.lastTime) * 0.001, 0.033) || 0.016;
    this.lastTime = now;

    // 1. Calcular centros estáticos basados en el contenedor fijo del dock
    // Esto es CRUCIAL: al usar centros estáticos, los ítems nunca tiemblan ni se desestabilizan mutuamente
    if (this.isHovered && Number.isFinite(this.mouseX) && this.panelRef) {
      const panelEl = this.panelRef.nativeElement;
      const panelRect = panelEl.getBoundingClientRect();
      const itemCount = this.items.length;
      const gap = 6;
      const totalContentWidth = itemCount * this.baseItemSize + (itemCount - 1) * gap;
      const paddingLeft = Math.max(0, (panelRect.width - totalContentWidth) / 2);

      for (let i = 0; i < itemCount; i++) {
        if (!this.itemStates[i]) continue;
        const staticItemCenterX =
          panelRect.left + paddingLeft + i * (this.baseItemSize + gap) + this.baseItemSize / 2;
        const distanceToMouse = Math.abs(this.mouseX - staticItemCenterX);

        if (distanceToMouse < this.distance) {
          const factor = Math.cos((distanceToMouse / this.distance) * (Math.PI / 2));
          this.itemStates[i].targetSize =
            this.baseItemSize + (this.magnification - this.baseItemSize) * factor;
        } else {
          this.itemStates[i].targetSize = this.baseItemSize;
        }
      }
    } else {
      for (const state of this.itemStates) {
        state.targetSize = this.baseItemSize;
      }
    }

    // 2. Simulación de física amortiguada suave sin oscilación ni rebote
    let hasSignificantMotion = false;
    const { mass, stiffness, damping } = this.spring;

    for (let i = 0; i < this.itemStates.length; i++) {
      const state = this.itemStates[i];
      const displacement = state.size - state.targetSize;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * state.velocity;
      const force = springForce + dampingForce;
      const acceleration = force / mass;

      state.velocity += acceleration * dt;
      state.size += state.velocity * dt;

      if (Math.abs(displacement) > 0.05 || Math.abs(state.velocity) > 0.05) {
        hasSignificantMotion = true;
      } else {
        state.size = state.targetSize;
        state.velocity = 0;
      }
    }

    this.cdr.markForCheck();

    if (hasSignificantMotion || this.isHovered) {
      this.rafId = requestAnimationFrame(this.renderLoop);
    } else {
      this.rafId = null;
    }
  };
}
