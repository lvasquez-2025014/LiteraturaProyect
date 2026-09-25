import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

export interface DuoNavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  badge?: string;
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

  isMobileMenuOpen = false;
  isMoreMenuOpen = false;
  isProfileModalOpen = false;
  currentActiveItem: string = 'roadmap';

  ngOnInit() {
    this.updateActiveItemFromUrl(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveItemFromUrl(event.urlAfterRedirects || event.url);
        this.closeMobileMenu();
        this.isMoreMenuOpen = false;
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

  toggleMoreMenu(): void {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;
    this.isProfileModalOpen = false;
  }

  toggleProfileModal(): void {
    this.isProfileModalOpen = !this.isProfileModalOpen;
    this.isMoreMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
    this.isMoreMenuOpen = false;
    this.isProfileModalOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.duo-more-popover') && !target.closest('.nav-item-more')) {
      this.isMoreMenuOpen = false;
    }
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  get navItems(): DuoNavItem[] {
    const role = this.user?.role;

    if (role === 'ADMIN_ROLE') {
      return [
        { id: 'admin', label: 'ADMINISTRADOR', route: '/admin', icon: 'admin' },
        { id: 'teacher', label: 'PORTAL DOCENTE', route: '/profesor', icon: 'teacher' },
        { id: 'roadmap', label: 'APRENDER', route: '/estudiante?tab=roadmap', icon: 'learn' },
        { id: 'class-activity', label: 'SONIDOS', route: '/estudiante?tab=class-activity', icon: 'sounds' },
        { id: 'leaderboard', label: 'LIGAS', route: '/estudiante?tab=leaderboard', icon: 'leagues' },
        { id: 'achievements', label: 'DESAFÍOS', route: '/estudiante?tab=achievements', icon: 'quests' },
        { id: 'rewards', label: 'TIENDA', route: '/estudiante?tab=rewards', icon: 'shop' },
        { id: 'profile', label: 'PERFIL', route: '', icon: 'profile' },
        { id: 'more', label: 'MÁS', route: '', icon: 'more' },
      ];
    }

    if (role === 'TEACHER_ROLE') {
      return [
        { id: 'teacher', label: 'PORTAL DOCENTE', route: '/profesor', icon: 'teacher' },
        { id: 'students', label: 'ALUMNOS', route: '/profesor?tab=students', icon: 'students' },
        { id: 'class-activities', label: 'SONIDOS', route: '/profesor?tab=class-activities', icon: 'sounds' },
        { id: 'readings', label: 'CATÁLOGO', route: '/profesor?tab=readings', icon: 'readings' },
        { id: 'stages', label: 'ETAPAS', route: '/profesor?tab=stages', icon: 'stages' },
        { id: 'roadmap', label: 'APRENDER', route: '/estudiante?tab=roadmap', icon: 'learn' },
        { id: 'leaderboard', label: 'LIGAS', route: '/estudiante?tab=leaderboard', icon: 'leagues' },
        { id: 'profile', label: 'PERFIL', route: '', icon: 'profile' },
        { id: 'more', label: 'MÁS', route: '', icon: 'more' },
      ];
    }

    // STUDENT_ROLE (Secciones completas de Duolingo)
    return [
      { id: 'roadmap', label: 'APRENDER', route: '/estudiante?tab=roadmap', icon: 'learn' },
      { id: 'class-activity', label: 'SONIDOS', route: '/estudiante?tab=class-activity', icon: 'sounds' },
      { id: 'leaderboard', label: 'LIGAS', route: '/estudiante?tab=leaderboard', icon: 'leagues' },
      { id: 'achievements', label: 'DESAFÍOS', route: '/estudiante?tab=achievements', icon: 'quests' },
      { id: 'rewards', label: 'TIENDA', route: '/estudiante?tab=rewards', icon: 'shop' },
      { id: 'profile', label: 'PERFIL', route: '', icon: 'profile' },
      { id: 'more', label: 'MÁS', route: '', icon: 'more' },
    ];
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
      } else if (url.includes('tab=students')) {
        this.currentActiveItem = 'students';
      } else {
        this.currentActiveItem = 'teacher';
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
        this.currentActiveItem = 'roadmap';
      }
    }
  }

  handleItemClick(item: DuoNavItem): void {
    if (item.id === 'profile') {
      this.toggleProfileModal();
      return;
    }
    if (item.id === 'more') {
      this.toggleMoreMenu();
      return;
    }
    this.isMoreMenuOpen = false;
    this.isProfileModalOpen = false;
    this.currentActiveItem = item.id;
    this.router.navigateByUrl(item.route);
    this.closeMobileMenu();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get coins(): number {
    if (this.auth.isAdmin()) return 99999;
    return this.user?.coins ?? 60;
  }

  get streakDays(): number {
    if (this.auth.isAdmin()) return 30;
    return this.user?.stats?.streakDays || 0;
  }

  get totalXp(): number {
    if (this.auth.isAdmin()) return 99999;
    return this.user?.stats?.totalXp || 0;
  }

  get currentLevel(): number {
    if (this.auth.isAdmin()) return 38;
    return this.user?.stats?.currentLevel || 1;
  }

  get equippedFrame(): string {
    return this.user?.equippedFrame || 'frame-default';
  }

  formatStat(val: number): string {
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val.toString();
  }
}
