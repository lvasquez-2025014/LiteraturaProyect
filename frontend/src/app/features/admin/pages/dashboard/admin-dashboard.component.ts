import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User, KINAL_GRADE_GROUPS, KINAL_SECTIONS } from '../../../../core/models/user.model';
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

  readonly gradeGroups = KINAL_GRADE_GROUPS;
  readonly sections = KINAL_SECTIONS;

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
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      this.onRoleChanged(role || '');
    });
  }

  openCreateModal() {
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      role: 'TEACHER_ROLE',
      grade: '',
      section: '',
    });
    this.onRoleChanged('TEACHER_ROLE');
    this.showCreateModal = true;
    this.cdr.markForCheck();
  }

  private onRoleChanged(role: string) {
    const gradeCtrl = this.userForm.get('grade');
    const sectionCtrl = this.userForm.get('section');
    if (role === 'STUDENT_ROLE') {
      gradeCtrl?.setValidators([Validators.required]);
      sectionCtrl?.setValidators([Validators.required]);
    } else {
      gradeCtrl?.clearValidators();
      gradeCtrl?.setValue('', { emitEvent: false });
      sectionCtrl?.clearValidators();
      sectionCtrl?.setValue('', { emitEvent: false });
    }
    gradeCtrl?.updateValueAndValidity();
    sectionCtrl?.updateValueAndValidity();
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
        if (newRole !== 'STUDENT_ROLE') {
          user.grade = '';
          user.section = '';
        }
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

    const payload = { ...this.userForm.value };
    if (payload.role !== 'STUDENT_ROLE') {
      payload.grade = '';
      payload.section = '';
    }

    this.http.post(`${environment.apiUrl}/users`, payload).subscribe({
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
        this.onRoleChanged('TEACHER_ROLE');
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

  canDeleteUser(targetUser: User): boolean {
    const current = this.auth.currentUserSignal();
    if (!current) return false;
    const currentId = current.id || (current as any)._id;
    const targetId = targetUser.id || (targetUser as any)._id;

    // No puede eliminarse a sí mismo
    if (currentId === targetId || current.email?.toLowerCase() === targetUser.email?.toLowerCase()) {
      return false;
    }

    // La cuenta del Administrador Principal (.env) nunca se puede eliminar
    if (targetUser.isSuperAdmin) {
      return false;
    }

    // Si el usuario destino es ADMIN_ROLE, SOLO el Administrador Principal del .env puede eliminarlo
    if (targetUser.role === 'ADMIN_ROLE') {
      return !!current.isSuperAdmin;
    }

    // Estudiantes y docentes pueden ser eliminados por cualquier admin
    return true;
  }

  canChangeRole(targetUser: User): boolean {
    const current = this.auth.currentUserSignal();
    if (!current) return false;
    const currentId = current.id || (current as any)._id;

    // No puede cambiar su propio rol
    if (currentId === (targetUser.id || (targetUser as any)._id)) return false;

    // La cuenta del Administrador Principal (.env) nunca puede ser modificada
    if (targetUser.isSuperAdmin) return false;

    // Si el usuario es ADMIN_ROLE, solo el Administrador Principal del .env puede modificar su rol
    if (targetUser.role === 'ADMIN_ROLE' && !current.isSuperAdmin) {
      return false;
    }

    return true;
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

