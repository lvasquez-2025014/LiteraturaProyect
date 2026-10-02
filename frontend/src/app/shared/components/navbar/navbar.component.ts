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

  get menuSections(): NavSection[] {
    const role = this.user?.role;

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

  get filteredMenuSections(): NavSection[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.menuSections;
    }
    return this.menuSections
      .map((sec) => ({
        label: sec.label,
        children: sec.children.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query)
        ),
      }))
      .filter((sec) => sec.children.length > 0);
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

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
  }
}
