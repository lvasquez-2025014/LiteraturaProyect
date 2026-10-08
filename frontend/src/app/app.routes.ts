import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'estudiante',
    loadComponent: () =>
      import('./features/student/pages/home/home.component').then((m) => m.StudentHomeComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE'] },
  },

  {
    path: 'profesor',
    loadComponent: () =>
      import('./features/teacher/pages/dashboard/teacher-dashboard.component').then(
        (m) => m.TeacherDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER_ROLE', 'ADMIN_ROLE'] },
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/pages/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN_ROLE'] },
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
