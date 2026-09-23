import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DockComponent, DockItemConfig } from '../dock/dock.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DockComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  auth = inject(AuthService);
  isUserMenuOpen = false;

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeUserMenu();
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  get dockItems(): DockItemConfig[] {
    const role = this.user?.role;
    if (role !== 'ADMIN_ROLE' && role !== 'TEACHER_ROLE') {
      return [];
    }

    const items: DockItemConfig[] = [];

    if (role === 'ADMIN_ROLE') {
      items.push({
        id: 'admin',
        label: 'Admin',
        route: '/admin',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
      });
    }

    items.push({
      id: 'teacher',
      label: 'Docente',
      route: '/profesor',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    });

    items.push({
      id: 'student',
      label: 'Aventura',
      route: '/estudiante',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`,
    });

    return items;
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
      case 'ADMIN_ROLE': return 'Administrador';
      case 'TEACHER_ROLE': return 'Profesor';
      case 'STUDENT_ROLE': return 'Estudiante';
      default: return '';
    }
  }

  getShortRoleLabel(role?: string): string {
    switch (role) {
      case 'ADMIN_ROLE': return 'Admin';
      case 'TEACHER_ROLE': return 'Docente';
      case 'STUDENT_ROLE': return 'Alumno';
      default: return '';
    }
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'ADMIN_ROLE': return 'badge-admin';
      case 'TEACHER_ROLE': return 'badge-teacher';
      case 'STUDENT_ROLE': return 'badge-student';
      default: return '';
    }
  }

  formatStat(val: number): string {
    if (val >= 100000) {
      return `${Math.round(val / 1000)}k`;
    }
    return val.toString();
  }

  logout(): void {
    this.closeUserMenu();
    this.auth.logout();
  }
}
