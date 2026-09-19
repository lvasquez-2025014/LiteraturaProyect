import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  users: User[] = [];
  loading = false;
  showCreateModal = false;
  successMessage = '';
  errorMessage = '';

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['TEACHER_ROLE', Validators.required],
    grade: [''],
    section: [''],
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users = (data || []).map((u) => ({
          ...u,
          id: u.id || (u._id ? (typeof u._id === 'object' ? u._id.toString() : u._id) : ''),
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando cuentas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onRoleChange(user: User, newRole: string) {
    const userId = user.id || (user as any)._id;
    if (!userId || user.role === newRole) return;

    this.http.patch(`${environment.apiUrl}/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => {
        user.role = newRole as any;
        this.showToast('Rol actualizado correctamente');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error actualizando rol:', err);
        alert(err.error?.message || 'Error actualizando rol en el servidor');
        this.loadUsers();
      },
    });
  }

  onCreateUser() {
    if (this.userForm.invalid) return;

    this.http.post(`${environment.apiUrl}/users`, this.userForm.value).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.userForm.reset({
          name: '',
          email: '',
          password: '',
          role: 'TEACHER_ROLE',
          grade: '',
          section: '',
        });
        this.showToast('Cuenta registrada exitosamente');
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Error registrando estudiante o docente');
      },
    });
  }

  onDeleteUser(user: User) {
    const userId = user.id || (user as any)._id;
    if (!userId) return;

    if (!confirm(`¿Seguro que deseas dar de baja la cuenta de "${user.name}"?`)) return;

    this.http.delete(`${environment.apiUrl}/users/${userId}`).subscribe({
      next: () => {
        this.showToast('Cuenta eliminada del sistema');
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Error eliminando cuenta');
      },
    });
  }

  private showToast(msg: string) {
    this.successMessage = msg;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.markForCheck();
    }, 3500);
  }
}

