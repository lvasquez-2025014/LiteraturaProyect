import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import {
  User,
  KINAL_GRADE_LEVELS,
  KINAL_CAREERS,
  KINAL_SECTIONS,
  isPeritoGrade,
  formatFullGrade,
  parseGradeLevelAndCareer,
} from '../../../../core/models/user.model';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  readonly gradeLevels = KINAL_GRADE_LEVELS;
  readonly careers = KINAL_CAREERS;
  readonly sections = KINAL_SECTIONS;

  users: User[] = [];
  loading = false;
  creatingUser = false;
  showCreateModal = false;
  successMessage = '';
  errorMessage = '';

  // Estado para creación de estudiante con grado y carrera separados
  newStudentGradeLevel = '';
  newStudentCareer = '';

  get isNewStudentPerito(): boolean {
    return isPeritoGrade(this.newStudentGradeLevel);
  }

  onNewStudentGradeChange() {
    if (!this.isNewStudentPerito) {
      this.newStudentCareer = '';
    }
    const full = formatFullGrade(this.newStudentGradeLevel, this.newStudentCareer);
    this.userForm.patchValue({ grade: full });
  }

  // Estado para la edición de Grado y Sección (Solo Admin)
  showEditGradeModal = false;
  editingStudent: User | null = null;
  editGradeLevel = '';
  editCareer = '';
  editSection = '';
  savingGrade = false;
  editGradeError = '';

  get isEditStudentPerito(): boolean {
    return isPeritoGrade(this.editGradeLevel);
  }

  onEditGradeLevelChange() {
    if (!this.isEditStudentPerito) {
      this.editCareer = '';
    }
  }

  get isAdmin(): boolean {
    return this.auth.currentUserSignal()?.role === 'ADMIN_ROLE';
  }

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
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
    this.newStudentGradeLevel = '';
    this.newStudentCareer = '';
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
        } else if (!user.grade) {
          this.openEditGradeModal(user);
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

  openEditGradeModal(user: User) {
    if (!this.isAdmin) return;
    this.editingStudent = user;
    const parsed = parseGradeLevelAndCareer(user.grade);
    this.editGradeLevel = parsed.level;
    this.editCareer = parsed.career;
    this.editSection = user.section || 'A';
    this.editGradeError = '';
    this.showEditGradeModal = true;
    this.cdr.markForCheck();
  }

  closeEditGradeModal() {
    this.showEditGradeModal = false;
    this.editingStudent = null;
    this.editGradeLevel = '';
    this.editCareer = '';
    this.editSection = '';
    this.editGradeError = '';
    this.cdr.markForCheck();
  }

  onSaveGradeSection() {
    if (!this.isAdmin) {
      this.editGradeError = 'Acción permitida únicamente para administradores';
      return;
    }

    if (!this.editingStudent || !this.editGradeLevel || !this.editSection) {
      this.editGradeError = 'Por favor selecciona el grado escolar y la sección';
      return;
    }

    if (this.isEditStudentPerito && !this.editCareer) {
      this.editGradeError = 'Por favor selecciona la carrera técnica correspondiente';
      return;
    }

    const fullGrade = formatFullGrade(this.editGradeLevel, this.editCareer);
    const userId = this.editingStudent.id || (this.editingStudent as any)._id;
    if (!userId) return;

    this.savingGrade = true;
    this.editGradeError = '';

    this.http.patch<User>(`${environment.apiUrl}/users/${userId}/academic-profile`, {
      grade: fullGrade,
      section: this.editSection,
    }).subscribe({
      next: (updated) => {
        const studentName = this.editingStudent?.name;
        if (this.editingStudent) {
          this.editingStudent.grade = updated.grade || fullGrade;
          this.editingStudent.section = updated.section || this.editSection;
        }
        const found = this.users.find((u) => (u.id || (u as any)._id) === userId);
        if (found) {
          found.grade = updated.grade || fullGrade;
          found.section = updated.section || this.editSection;
        }

        this.savingGrade = false;
        this.showEditGradeModal = false;
        this.editingStudent = null;
        this.showToast(`Grado y sección de "${studentName}" actualizados correctamente`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error actualizando grado y sección:', err);
        this.savingGrade = false;
        this.editGradeError = err.error?.message || 'Error actualizando datos académicos en el servidor';
        this.cdr.markForCheck();
      },
    });
  }

  onCreateUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.creatingUser = true;
    const payload = { ...this.userForm.value };
    if (payload.role !== 'STUDENT_ROLE') {
      payload.grade = '';
      payload.section = '';
    }

    this.http.post(`${environment.apiUrl}/users`, payload).subscribe({
      next: () => {
        this.creatingUser = false;
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
        this.creatingUser = false;
        this.cdr.markForCheck();
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

