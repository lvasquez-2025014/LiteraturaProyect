import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { StudentPerformance } from '../../../../core/models/reading.model';
import { StudentDetailModalComponent } from '../../components/student-detail-modal/student-detail-modal.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, StudentDetailModalComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css',
})
export class TeacherDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  students: User[] = [];
  loading = false;
  searchQuery = '';
  selectedGrade = 'all';
  selectedSection = 'all';
  selectedStudentForModal: StudentPerformance | null = null;

  get user() {
    return this.auth.currentUserSignal();
  }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/users?role=STUDENT_ROLE`).subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando estudiantes:', err);
        this.loading = false;
      },
    });
  }

  get filteredStudents(): User[] {
    return this.students.filter((student) => {
      const matchesGrade =
        this.selectedGrade === 'all' ||
        (student.grade && student.grade.toLowerCase().includes(this.selectedGrade.toLowerCase()));
      const matchesSection =
        this.selectedSection === 'all' ||
        (student.section && student.section.toUpperCase() === this.selectedSection.toUpperCase());
      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      return matchesGrade && matchesSection && matchesSearch;
    });
  }

  get filteredPerformance(): StudentPerformance[] {
    return this.filteredStudents.map((s) => this.toStudentPerformance(s));
  }

  get averageWpm(): number {
    const list = this.filteredStudents;
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + (s.stats?.averageWpm || 0), 0);
    return Math.round(total / list.length);
  }

  get averageComprehension(): number {
    const list = this.filteredStudents;
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + (s.stats?.comprehensionRate || 0), 0);
    return Math.round(total / list.length);
  }

  get activeStreaksCount(): number {
    return this.filteredPerformance.filter((p) => p.streakDays >= 3).length;
  }

  getStudentStatus(wpm: number, comp: number): 'Destacado' | 'En Progreso' | 'Atención Requerida' {
    if (wpm >= 170 && comp >= 85) return 'Destacado';
    if (wpm >= 120 && comp >= 65) return 'En Progreso';
    return 'Atención Requerida';
  }

  toStudentPerformance(student: User): StudentPerformance {
    const wpm = student.stats?.averageWpm || 0;
    const comp = student.stats?.comprehensionRate || 0;
    const completed = student.stats?.completedReadings || 0;
    const streak = student.stats?.streakDays || (completed > 0 ? Math.min(completed, 5) : 0);

    const baseWpm = Math.max(60, wpm > 0 ? wpm - 25 : 85);
    return {
      student,
      averageWpm: wpm,
      comprehensionRate: comp,
      streakDays: streak,
      completedReadings: completed,
      status: this.getStudentStatus(wpm, comp),
      weeklyHistory: [
        { week: 'Sem 1', wpm: baseWpm, comprehension: Math.max(50, comp > 0 ? comp - 15 : 70) },
        { week: 'Sem 2', wpm: baseWpm + 10, comprehension: Math.max(60, comp > 0 ? comp - 10 : 75) },
        { week: 'Sem 3', wpm: baseWpm + 18, comprehension: Math.max(65, comp > 0 ? comp - 5 : 80) },
        { week: 'Sem 4', wpm: wpm > 0 ? wpm : baseWpm + 25, comprehension: comp > 0 ? comp : 85 },
      ],
      recentReadings: [
        {
          title: 'El Cadejo y el Guardián de la Noche',
          date: 'Ayer, 16:40',
          wpm: wpm > 0 ? wpm : 145,
          score: comp > 0 ? comp : 90,
        },
        {
          title: 'La Leyenda del Sombrerón en Antigua',
          date: 'Hace 3 días',
          wpm: Math.max(70, wpm > 0 ? wpm - 10 : 135),
          score: Math.max(60, comp > 0 ? comp - 5 : 85),
        },
        {
          title: 'Tecún Umán y el Quetzal Esmeralda',
          date: 'Hace 5 días',
          wpm: Math.max(60, wpm > 0 ? wpm - 20 : 125),
          score: Math.max(60, comp > 0 ? comp - 10 : 80),
        },
      ],
    };
  }

  openStudentModal(item: StudentPerformance) {
    this.selectedStudentForModal = item;
  }

  closeStudentModal() {
    this.selectedStudentForModal = null;
  }
}
