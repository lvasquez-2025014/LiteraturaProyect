import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  auth = inject(AuthService);

  get user() {
    return this.auth.currentUserSignal();
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'ADMIN_ROLE': return 'Administrador';
      case 'TEACHER_ROLE': return 'Profesor';
      case 'STUDENT_ROLE': return 'Estudiante';
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

  logout() {
    this.auth.logout();
  }
}
