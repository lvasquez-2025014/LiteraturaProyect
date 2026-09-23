import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockComponent implements OnInit, OnDestroy {
  @Input() items: DockItemConfig[] = [];
  @Input() className = '';
  @Input() baseItemSize = 38;
  @Input() magnification = 50;
  @Input() distance = 110;
  @Input() spring?: any;
  @Input() panelHeight = 44;
  @Input() layout: 'inline' | 'floating' = 'inline';
  @Input() labelPosition: 'top' | 'bottom' | 'auto' = 'auto';
  @Input() theme: 'auto' | 'light' | 'dark' | 'glass' = 'auto';
  @Input() ariaLabel = 'Portales de navegación';

  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  hoveredIndex: number | null = null;
  private svgCache = new Map<string, SafeHtml>();
  private routerSub?: Subscription;

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hoveredIndex = null;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
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

  getItemScale(index: number): number {
    if (this.hoveredIndex === null) return 1.0;
    const diff = Math.abs(this.hoveredIndex - index);
    if (diff === 0) return 1.28; // Ítem bajo el cursor con magnificación elástica
    if (diff === 1) return 1.12; // Vecinos inmediatos con onda de atracción magnética
    return 1.0;
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

  onPanelMouseLeave(): void {
    this.hoveredIndex = null;
    this.cdr.markForCheck();
  }

  onItemClick(item: DockItemConfig, event: MouseEvent): void {
    this.hoveredIndex = null;
    this.cdr.markForCheck();

    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    }
    // Si tiene ruta definida, Angular RouterLink ejecuta la navegación nativa de inmediato
  }
}
