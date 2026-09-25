import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { StudentHomeComponent } from './features/student/pages/home/home.component';
import { TeacherDashboardComponent } from './features/teacher/pages/dashboard/teacher-dashboard.component';
import { AdminDashboardComponent } from './features/admin/pages/dashboard/admin-dashboard.component';
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
    component: LoginComponent,
  },
  {
    path: 'estudiante',
    component: StudentHomeComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE'] },
  },

  {
    path: 'profesor',
    component: TeacherDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER_ROLE', 'ADMIN_ROLE'] },
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN_ROLE'] },
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
