import { Component, inject, OnInit } from '@angular/core';
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
  auth = inject(AuthService);

  users: User[] = [];
  loading = false;
  showCreateModal = false;

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
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onRoleChange(user: User, newRole: string) {
    if (user.role === newRole) return;
    this.http.patch(`${environment.apiUrl}/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        user.role = newRole as any;
      },
      error: (err) => {
        alert(err.error?.message || 'Error actualizando rol');
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
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Error registrando estudiante o docente');
      },
    });
  }

  onDeleteUser(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este registro de estudiante o docente?')) return;

    this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }
}
