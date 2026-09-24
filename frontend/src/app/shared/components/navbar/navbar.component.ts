import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  BranchedMenuComponent,
  BranchedMenuItem,
  BranchedMenuChild,
} from '../branched-menu/branched-menu.component';
import {
  DashboardSquare01Icon,
  Book02Icon,
  UserGroupIcon,
  Rocket01Icon,
  StarIcon,
  CrownIcon,
  Award01Icon,
} from './navbar-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, BranchedMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private navSub?: Subscription;

  isMobileMenuOpen = false;
  currentActiveItem: string = '';

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
    this.removeBodyScrollLock();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScrollLock();
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.updateBodyScrollLock();
    }
  }

  private updateBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      if (this.isMobileMenuOpen) {
        document.body.classList.add('mobile-nav-locked');
      } else {
        document.body.classList.remove('mobile-nav-locked');
      }
    }
  }

  private removeBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mobile-nav-locked');
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  get branchedMenuItems(): BranchedMenuItem[] {
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
              icon: Book02Icon,
              route: '/profesor',
            },
            {
              value: 'student',
              label: 'Aventura Estudiante',
              icon: Rocket01Icon,
              route: '/estudiante',
            },
          ],
        },
        {
          label: 'Gestión Institucional',
          children: [
            {
              value: 'users',
              label: 'Cuentas & Roles',
              icon: UserGroupIcon,
              route: '/admin',
            },
            {
              value: 'readings',
              label: 'Catálogo de Lecturas',
              icon: Book02Icon,
              route: '/profesor?tab=readings',
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
              value: 'readings',
              label: 'Catálogo de Lecturas',
              icon: Book02Icon,
              route: '/profesor?tab=readings',
            },
            {
              value: 'stages',
              label: 'Rutas & Etapas',
              icon: Award01Icon,
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
              icon: Rocket01Icon,
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
            value: 'roadmap',
            label: 'Mapa de Rutas',
            icon: Rocket01Icon,
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

  private updateActiveItemFromUrl(url: string) {
    if (url.startsWith('/admin')) {
      this.currentActiveItem = 'admin';
    } else if (url.startsWith('/profesor')) {
      if (url.includes('tab=readings')) {
        this.currentActiveItem = 'readings';
      } else if (url.includes('tab=stages')) {
        this.currentActiveItem = 'stages';
      } else {
        this.currentActiveItem = this.user?.role === 'ADMIN_ROLE' ? 'teacher' : 'students';
      }
    } else if (url.startsWith('/estudiante')) {
      if (url.includes('tab=rewards')) {
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

  onMenuSelect(event: { value: string; item: BranchedMenuItem | BranchedMenuChild }) {
    this.currentActiveItem = event.value;
    const targetRoute = event.item.route;
    if (targetRoute) {
      this.router.navigateByUrl(targetRoute);
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

  get equippedTitle(): string {
    if (this.auth.isAdmin()) {
      return this.user?.equippedTitle || 'Lector Destacado';
    }
    return this.user?.equippedTitle || 'Cadete de las Letras';
  }

  get equippedFrame(): string {
    if (this.auth.isAdmin()) {
      return this.user?.equippedFrame || 'frame-kinal';
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
        return '';
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
        return '';
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
