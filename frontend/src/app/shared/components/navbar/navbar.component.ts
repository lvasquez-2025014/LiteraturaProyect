import {
  Component,
  inject,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  DashboardSquare01Icon,
  TeacherPortalIcon,
  StudentAdventureIcon,
  ClassActivityIcon,
  UserGroupIcon,
  Book02Icon,
  StagesRoadmapIcon,
  StarIcon,
  CrownIcon,
  Award01Icon,
  IconSvgObject,
} from './navbar-icons';

export interface NavItem {
  value: string;
  label: string;
  icon: IconSvgObject;
  route: string;
  badge?: string;
}

export interface NavSection {
  label: string;
  children: NavItem[];
}

export interface PassportStage {
  id: string;
  name: string;
  levelsLabel: string;
  minLevel: number;
  maxLevel: number;
  symbolId: string;
  rotationDeg: number;
}

export const PASSPORT_STAGES: readonly PassportStage[] = [
  { id: 'semillero', name: 'Semillero', levelsLabel: '1–5', minLevel: 1, maxLevel: 5, symbolId: 'stamp-sprout', rotationDeg: 3 },
  { id: 'expedicion', name: 'Expedición', levelsLabel: '6–10', minLevel: 6, maxLevel: 10, symbolId: 'stamp-compass', rotationDeg: -4 },
  { id: 'cronicas', name: 'Crónicas', levelsLabel: '11–20', minLevel: 11, maxLevel: 20, symbolId: 'stamp-scroll', rotationDeg: 4 },
  { id: 'cumbres', name: 'Cumbres', levelsLabel: '21–30', minLevel: 21, maxLevel: 30, symbolId: 'stamp-mountain', rotationDeg: -3 },
  { id: 'cuspide', name: 'Cúspide', levelsLabel: '31–38', minLevel: 31, maxLevel: 38, symbolId: 'stamp-summit', rotationDeg: 5 },
] as const;

export interface LeagueBadge {
  name: string;
  chevrons: readonly number[];
  minXp: number;
}

export const LEAGUE_BADGES: readonly LeagueBadge[] = [
  { name: 'Bronce', chevrons: [1], minXp: 0 },
  { name: 'Plata', chevrons: [1, 2], minXp: 3000 },
  { name: 'Oro', chevrons: [1, 2, 3], minXp: 10000 },
  { name: 'Zafiro', chevrons: [1, 2, 3, 4], minXp: 25000 },
  { name: 'Diamante', chevrons: [1, 2, 3, 4, 5], minXp: 50000 },
] as const;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private navSub?: Subscription;

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  isMobileMenuOpen = false;
  currentActiveItem: string = '';
  searchQuery: string = '';

  ngOnInit() {
    this.updateActiveItemFromUrl(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveItemFromUrl(event.urlAfterRedirects || event.url);
        this.closeMobileMenu();
      });
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.searchQuery) {
      this.clearSearch();
      return;
    }
    this.closeMobileMenu();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInputRef?.nativeElement.focus();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  clearSearch(): void {
    this.searchQuery = '';
    if (this.searchInputRef?.nativeElement) {
      this.searchInputRef.nativeElement.value = '';
    }
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  private _cachedRole?: string;
  private _cachedMenuSections: NavSection[] | null = null;
  private _cachedBottomNavItems: NavItem[] | null = null;
  private _cachedBottomLeftItems: NavItem[] | null = null;
  private _cachedBottomRightItems: NavItem[] | null = null;
  private _lastSearchQuery: string = '';
  private _cachedFilteredSections: NavSection[] | null = null;

  private readonly shortNavLabels: Record<string, string> = {
    admin: 'Admin',
    teacher: 'Docente',
    student: 'Aventura',
    'class-activities': 'Clases',
    students: 'Alumnos',
    readings: 'Lecturas',
    stages: 'Etapas',
    adventure: 'Aventura',
    'class-activity': 'Clases',
    roadmap: 'Rutas',
    rewards: 'Premios',
    leaderboard: 'Ranking',
    achievements: 'Logros',
  };

  get menuSections(): NavSection[] {
    const role = this.user?.role;
    if (this._cachedMenuSections && this._cachedRole === role) {
      return this._cachedMenuSections;
    }
    this._cachedRole = role;
    this._cachedMenuSections = this.buildMenuSections(role);
    this._cachedBottomNavItems = null;
    this._cachedBottomLeftItems = null;
    this._cachedBottomRightItems = null;
    this._cachedFilteredSections = null;
    return this._cachedMenuSections;
  }

  private buildMenuSections(role?: string): NavSection[] {
    if (role === 'ADMIN_ROLE') {
      return [
        {
          label: 'Portales de Acceso',
          children: [
            {
              value: 'admin',
              label: 'Panel Administrador',
              icon: DashboardSquare01Icon,
              route: '/admin',
            },
            {
              value: 'teacher',
              label: 'Portal Docente',
              icon: TeacherPortalIcon,
              route: '/profesor',
            },
            {
              value: 'student',
              label: 'Aventura Estudiante',
              icon: StudentAdventureIcon,
              route: '/estudiante',
            },
          ],
        },
        {
          label: 'Gestión Institucional',
          children: [
            {
              value: 'class-activities',
              label: 'Actividades en Clase',
              icon: ClassActivityIcon,
              route: '/profesor?tab=class-activities',
            },
          ],
        },
      ];
    }

    if (role === 'TEACHER_ROLE') {
      return [
        {
          label: 'Portal Docente',
          children: [
            {
              value: 'students',
              label: 'Rendimiento Alumnos',
              icon: UserGroupIcon,
              route: '/profesor?tab=students',
            },
            {
              value: 'class-activities',
              label: 'Actividades en Clase',
              icon: ClassActivityIcon,
              route: '/profesor?tab=class-activities',
            },
            {
              value: 'readings',
              label: 'Catálogo de Lecturas',
              icon: Book02Icon,
              route: '/profesor?tab=readings',
            },
            {
              value: 'stages',
              label: 'Rutas & Etapas',
              icon: StagesRoadmapIcon,
              route: '/profesor?tab=stages',
            },
          ],
        },
        {
          label: 'Navegación Alumno',
          children: [
            {
              value: 'adventure',
              label: 'Ver Modo Aventura',
              icon: StudentAdventureIcon,
              route: '/estudiante',
            },
          ],
        },
      ];
    }

    // STUDENT_ROLE (o por defecto)
    return [
      {
        label: 'Mi Aventura Lectora',
        children: [
          {
            value: 'class-activity',
            label: 'Actividad en Clase',
            icon: ClassActivityIcon,
            route: '/estudiante?tab=class-activity',
          },
          {
            value: 'roadmap',
            label: 'Mapa de Rutas',
            icon: StagesRoadmapIcon,
            route: '/estudiante?tab=roadmap',
          },
          {
            value: 'rewards',
            label: 'Centro Recompensas',
            icon: StarIcon,
            route: '/estudiante?tab=rewards',
          },
          {
            value: 'leaderboard',
            label: 'Tabla de Posiciones',
            icon: CrownIcon,
            route: '/estudiante?tab=leaderboard',
          },
          {
            value: 'achievements',
            label: 'Mis Logros & Trofeos',
            icon: Award01Icon,
            route: '/estudiante?tab=achievements',
          },
        ],
      },
    ];
  }

  /**
   * Destinos aplanados de navegación móvil inferior derivados directamente de menuSections
   */
  get bottomNavItems(): NavItem[] {
    if (this._cachedBottomNavItems && this._cachedRole === this.user?.role) {
      return this._cachedBottomNavItems;
    }
    const flattened: NavItem[] = [];
    for (const section of this.menuSections) {
      for (const item of section.children) {
        flattened.push({
          ...item,
          label: this.shortNavLabels[item.value] || item.label,
        });
      }
    }
    this._cachedBottomNavItems = flattened;
    const splitIndex = Math.ceil(flattened.length / 2);
    this._cachedBottomLeftItems = flattened.slice(0, splitIndex);
    this._cachedBottomRightItems = flattened.slice(splitIndex);
    return flattened;
  }

  /**
   * Grupo izquierdo del dock inferior (recibe el elemento extra cuando el total es impar)
   */
  get bottomNavLeftItems(): NavItem[] {
    if (!this._cachedBottomLeftItems || this._cachedRole !== this.user?.role) {
      this.bottomNavItems;
    }
    return this._cachedBottomLeftItems || [];
  }

  /**
   * Grupo derecho del dock inferior
   */
  get bottomNavRightItems(): NavItem[] {
    if (!this._cachedBottomRightItems || this._cachedRole !== this.user?.role) {
      this.bottomNavItems;
    }
    return this._cachedBottomRightItems || [];
  }

  trackByItemValue(_index: number, item: NavItem): string {
    return item.value;
  }

  trackBySectionLabel(_index: number, section: NavSection): string {
    return section.label;
  }

  get filteredMenuSections(): NavSection[] {
    const query = this.searchQuery.trim().toLowerCase();
    const role = this.user?.role;
    if (
      this._cachedFilteredSections &&
      this._lastSearchQuery === query &&
      this._cachedRole === role
    ) {
      return this._cachedFilteredSections;
    }
    this._lastSearchQuery = query;
    if (!query) {
      this._cachedFilteredSections = this.menuSections;
      return this._cachedFilteredSections;
    }
    this._cachedFilteredSections = this.menuSections
      .map((sec) => ({
        label: sec.label,
        children: sec.children.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query)
        ),
      }))
      .filter((sec) => sec.children.length > 0);
    return this._cachedFilteredSections;
  }

  private updateActiveItemFromUrl(url: string) {
    if (url.startsWith('/admin')) {
      this.currentActiveItem = 'admin';
    } else if (url.startsWith('/profesor')) {
      if (url.includes('tab=class-activities')) {
        this.currentActiveItem = 'class-activities';
      } else if (url.includes('tab=readings')) {
        this.currentActiveItem = 'readings';
      } else if (url.includes('tab=stages')) {
        this.currentActiveItem = 'stages';
      } else {
        this.currentActiveItem = this.user?.role === 'ADMIN_ROLE' ? 'teacher' : 'students';
      }
    } else if (url.startsWith('/estudiante')) {
      if (url.includes('tab=class-activity')) {
        this.currentActiveItem = 'class-activity';
      } else if (url.includes('tab=rewards')) {
        this.currentActiveItem = 'rewards';
      } else if (url.includes('tab=leaderboard')) {
        this.currentActiveItem = 'leaderboard';
      } else if (url.includes('tab=achievements')) {
        this.currentActiveItem = 'achievements';
      } else {
        this.currentActiveItem = this.user?.role === 'STUDENT_ROLE' ? 'roadmap' : 'student';
      }
    }
  }

  onItemClick(item: NavItem): void {
    this.currentActiveItem = item.value;
    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
    this.closeMobileMenu();
  }

  get coins(): number {
    if (this.auth.isAdmin()) {
      return 99999;
    }
    return this.user?.coins ?? 60;
  }

  get streakDays(): number {
    if (this.auth.isAdmin()) {
      return 30;
    }
    return this.user?.stats?.streakDays || 0;
  }

  get totalXp(): number {
    if (this.auth.isAdmin()) {
      return 99999;
    }
    return this.user?.stats?.totalXp || 0;
  }

  get currentLevel(): number {
    if (this.auth.isAdmin()) {
      return 38;
    }
    return this.user?.stats?.currentLevel || 1;
  }

  get levelProgressPercent(): number {
    if (this.auth.isAdmin()) {
      return 88;
    }
    const xp = this.totalXp;
    const inLevel = xp % 500;
    return Math.max(15, Math.min(100, Math.round((inLevel / 500) * 100)));
  }

  get leagueName(): string {
    const xp = this.totalXp;
    if (xp >= 50000) return 'Diamante';
    if (xp >= 25000) return 'Zafiro';
    if (xp >= 10000) return 'Oro';
    if (xp >= 3000) return 'Plata';
    return 'Bronce';
  }

  get stageName(): string {
    const lvl = this.currentLevel;
    if (lvl >= 31) return 'Cúspide';
    if (lvl >= 21) return 'Cumbres';
    if (lvl >= 11) return 'Crónicas';
    if (lvl >= 6) return 'Expedición';
    return 'Semillero';
  }

  get equippedTitle(): string {
    if (this.auth.isAdmin()) {
      return this.user?.equippedTitle || 'Lector Destacado';
    }
    return this.user?.equippedTitle || 'Cadete de las Letras';
  }

  get equippedFrame(): string {
    if (this.auth.isAdmin()) {
      return this.user?.equippedFrame || 'frame-gold';
    }
    return this.user?.equippedFrame || 'frame-default';
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'Administrador';
      case 'TEACHER_ROLE':
        return 'Profesor';
      case 'STUDENT_ROLE':
        return 'Estudiante';
      default:
        return 'Comunidad Educativa';
    }
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'badge-admin';
      case 'TEACHER_ROLE':
        return 'badge-teacher';
      case 'STUDENT_ROLE':
        return 'badge-student';
      default:
        return 'badge-default';
    }
  }

  formatStat(val: number): string {
    if (val >= 100000) {
      return `${Math.round(val / 1000)}k`;
    }
    return val.toString();
  }

  readonly passportStages = PASSPORT_STAGES;
  readonly leagueBadges = LEAGUE_BADGES;
  readonly progressSegments = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  get filledSegmentsCount(): number {
    return Math.round(this.levelProgressPercent / 10);
  }

  getStageState(stage: PassportStage): 'completed' | 'current' | 'upcoming' {
    const lvl = this.currentLevel;
    if (lvl > stage.maxLevel) return 'completed';
    if (lvl >= stage.minLevel) return 'current';
    return 'upcoming';
  }

  get currentStageLevels(): string {
    const lvl = this.currentLevel;
    if (lvl >= 31) return '31–38';
    if (lvl >= 21) return '21–30';
    if (lvl >= 11) return '11–20';
    if (lvl >= 6) return '6–10';
    return '1–5';
  }

  get nextLeagueMessage(): string {
    const xp = this.totalXp;
    if (xp >= 50000) {
      return 'Liga máxima alcanzada';
    }
    if (xp >= 25000) {
      const diff = 50000 - xp;
      return `Te faltan ${this.formatStat(diff)} XP para Diamante`;
    }
    if (xp >= 10000) {
      const diff = 25000 - xp;
      return `Te faltan ${this.formatStat(diff)} XP para Zafiro`;
    }
    if (xp >= 3000) {
      const diff = 10000 - xp;
      return `Te faltan ${this.formatStat(diff)} XP para Oro`;
    }
    const diff = 3000 - xp;
    return `Te faltan ${this.formatStat(diff)} XP para Plata`;
  }

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
  }
}
