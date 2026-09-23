import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface BranchedMenuChild {
  value: string;
  label: string;
  icon?: any; // IconSvgObject tuple array or SVG string
  route?: string;
  badge?: string;
}

export interface BranchedMenuItem {
  label: string;
  value?: string;
  icon?: any;
  route?: string;
  badge?: string;
  children?: BranchedMenuChild[];
}

const PAD = 6;
const MARK = 16;

@Component({
  selector: 'app-branched-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branched-menu.component.html',
  styleUrl: './branched-menu.component.css',
})
export class BranchedMenuComponent implements AfterViewInit, OnChanges, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  @Input() items: BranchedMenuItem[] = [];
  @Input() defaultOpen: number | number[] = 0;
  @Input() defaultActive: string = '';
  @Input() color: string = '#f5f5f5';
  @Input() accentColor: string = '#f5f5f5';
  @Input() lineColor: string = '#3f3f46';
  @Input() width: number = 240;
  @Input() rowHeight: number = 36;
  @Input() indent: number = 40;
  @Input() trunk: number = 14;
  @Input() radius: number = 10;
  @Input() lineWidth: number = 1.5;
  @Input() fontSize: number = 14;
  @Input() drawDuration: number = 400;
  @Input() foldDuration: number = 300;
  @Input() className: string = '';

  @Output() selectItem = new EventEmitter<{ value: string; item: BranchedMenuItem | BranchedMenuChild }>();
  @Output() toggleSection = new EventEmitter<{ index: number; open: boolean }>();

  @ViewChild('navRef') navRef!: ElementRef<HTMLElement>;
  @ViewChild('markerRef') markerRef!: ElementRef<HTMLElement>;
  @ViewChildren('headBtn') headBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  openSet = new Set<number>();
  active: string = '';
  private resizeObserver?: ResizeObserver;

  ngOnInit() {
    this.initOpenSet();
    this.initActive();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultOpen'] && !changes['defaultOpen'].firstChange) {
      this.initOpenSet();
    }
    if (changes['defaultActive'] && changes['defaultActive'].currentValue !== undefined) {
      this.active = this.defaultActive;
    }
    this.schedulePlaceMarker(false);
  }

  ngAfterViewInit() {
    this.schedulePlaceMarker(true);

    if (typeof ResizeObserver !== 'undefined' && this.navRef?.nativeElement) {
      let first = true;
      this.resizeObserver = new ResizeObserver(() => {
        if (first) {
          first = false;
          return;
        }
        this.placeMarker(false);
      });
      this.resizeObserver.observe(this.navRef.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initOpenSet() {
    if (Array.isArray(this.defaultOpen)) {
      this.openSet = new Set(this.defaultOpen);
    } else if (typeof this.defaultOpen === 'number' && this.defaultOpen >= 0) {
      this.openSet = new Set([this.defaultOpen]);
    } else {
      this.openSet = new Set();
    }
  }

  private initActive() {
    if (this.defaultActive) {
      this.active = this.defaultActive;
      return;
    }
    const first = this.items.find((it, i) => it.children && this.openSet.has(i));
    this.active = first?.children?.[0]?.value ?? '';
  }

  isOpen(index: number): boolean {
    return this.openSet.has(index);
  }

  get activeSection(): number {
    return this.items.findIndex(it => it.children?.some(kid => kid.value === this.active));
  }

  get markerShown(): boolean {
    return this.activeSection >= 0 && this.openSet.has(this.activeSection);
  }

  toggle(i: number) {
    const wasOpen = this.openSet.has(i);
    if (wasOpen) {
      this.openSet.delete(i);
    } else {
      this.openSet.add(i);
    }
    this.toggleSection.emit({ index: i, open: !wasOpen });
    this.cdr.detectChanges();
    this.schedulePlaceMarker(true);
  }

  select(value: string, item: BranchedMenuItem | BranchedMenuChild) {
    this.active = value;
    this.selectItem.emit({ value, item });
    this.cdr.detectChanges();
    this.schedulePlaceMarker(true);
  }

  private schedulePlaceMarker(glide: boolean) {
    setTimeout(() => {
      this.placeMarker(glide);
    }, 10);
  }

  private placeMarker(glide: boolean) {
    const m = this.markerRef?.nativeElement;
    if (!m) return;

    const el = this.headBtns?.toArray()[this.activeSection]?.nativeElement;
    const on = this.markerShown && Boolean(el);

    if (!glide) {
      m.style.transition = 'none';
    }

    if (on && el) {
      m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
    }

    if (on) {
      m.setAttribute('data-on', '');
    } else {
      m.removeAttribute('data-on');
    }

    if (!glide) {
      void m.offsetHeight; // trigger reflow
      m.style.transition = '';
    }
  }

  // SVG Geometry Calculation
  calcR(): number {
    return Math.min(this.radius, this.rowHeight / 2 - 2);
  }

  calcEndX(): number {
    return this.indent - 8;
  }

  calcRowY(k: number): number {
    return PAD + k * this.rowHeight + this.rowHeight / 2;
  }

  calcBranchPath(k: number): string {
    const r = this.calcR();
    const endX = this.calcEndX();
    const y = this.calcRowY(k);
    return `M ${this.trunk} ${y - r} A ${r} ${r} 0 0 0 ${this.trunk + r} ${y} H ${endX}`;
  }

  calcReachPath(k: number): string {
    const r = this.calcR();
    const endX = this.calcEndX();
    const y = this.calcRowY(k);
    return `M ${this.trunk} 0 V ${y - r} A ${r} ${r} 0 0 0 ${this.trunk + r} ${y} H ${endX}`;
  }

  calcLength(k: number): number {
    const r = this.calcR();
    const endX = this.calcEndX();
    const y = this.calcRowY(k);
    return y - r + (Math.PI * r) / 2 + (endX - this.trunk - r);
  }

  calcBodyHeight(kidsCount: number): number {
    return PAD * 2 + kidsCount * this.rowHeight;
  }

  calcBasePath(kidsCount: number): string {
    const r = this.calcR();
    const lastRowY = this.calcRowY(kidsCount - 1);
    return `M ${this.trunk} 0 V ${lastRowY - r}`;
  }

  // Icon Support: Hugeicons tuple arrays, SVG markup strings, or plain text
  isIconTupleArray(icon: any): boolean {
    return Array.isArray(icon) && icon.length > 0 && Array.isArray(icon[0]);
  }

  isSvgString(icon: any): boolean {
    return typeof icon === 'string' && icon.trim().startsWith('<svg');
  }

  getSafeSvg(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}
