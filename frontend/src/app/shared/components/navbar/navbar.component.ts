import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
      return this.user?.equippedTitle || 'Ingeniero Humanista Kinal';
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
