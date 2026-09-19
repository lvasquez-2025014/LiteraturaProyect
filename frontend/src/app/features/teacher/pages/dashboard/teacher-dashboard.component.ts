import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { StudentPerformance, Reading, Question } from '../../../../core/models/reading.model';
import { StudentDetailModalComponent } from '../../components/student-detail-modal/student-detail-modal.component';
import { ReadingsService } from '../../../../core/services/readings.service';
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
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);
  readingsService = inject(ReadingsService);

  activeTab: 'students' | 'readings' = 'students';

  students: User[] = [];
  loading = false;
  searchQuery = '';
  selectedGrade = 'all';
  selectedSection = 'all';
  selectedStudentForModal: StudentPerformance | null = null;

  // Toast notification
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Readings Management State
  isReadingModalOpen = false;
  isEditingReading = false;
  editingReadingId: string | null = null;
  readingModalLoading = false;

  readingFormData = {
    title: '',
    level: 1,
    genre: 'Narrativa Guatemalteca',
    targetWpm: 150,
    xpReward: 100,
    difficulty: 'Intermedio' as 'Básico' | 'Intermedio' | 'Avanzado',
    author: 'Docente Kinal',
    pedagogicalSource: 'MINEDUC / Plan Lector Kinal',
    content: '',
    questions: [
      {
        id: 'q1',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ] as Question[],
  };

  trackByFn(index: number): number {
    return index;
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  get readings(): Reading[] {
    return this.readingsService.readingsSignal();
  }

  ngOnInit() {
    this.loadStudents();
    this.loadReadings();
  }

  setTab(tab: 'students' | 'readings') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  loadReadings() {
    this.readingsService.getReadings().subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Error cargando lecturas en Teacher Dashboard:', err);
        this.cdr.markForCheck();
      },
    });
  }

  loadStudents() {
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/users?role=STUDENT_ROLE`).subscribe({
      next: (data) => {
        this.students = (data || []).map((u: any) => ({
          ...u,
          id: u.id || u._id,
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando estudiantes:', err);
        this.loading = false;
        this.cdr.markForCheck();
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

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.markForCheck();
    }, 4500);
  }

  openCreateReadingModal() {
    this.isEditingReading = false;
    this.editingReadingId = null;
    this.readingFormData = {
      title: '',
      level: (this.readings.length % 10) + 1,
      genre: 'Narrativa Guatemalteca',
      targetWpm: 150,
      xpReward: 120,
      difficulty: 'Intermedio',
      author: 'Docente Kinal',
      pedagogicalSource: 'MINEDUC / Plan Lector Kinal',
      content: '',
      questions: [
        {
          id: 'q1',
          prompt: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
        },
      ],
    };
    this.isReadingModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditReadingModal(reading: Reading) {
    this.isEditingReading = true;
    this.editingReadingId = reading.id;
    this.readingFormData = {
      title: reading.title,
      level: reading.level,
      genre: reading.genre,
      targetWpm: reading.targetWpm,
      xpReward: reading.xpReward || 100,
      difficulty: reading.difficulty || 'Intermedio',
      author: reading.author || 'Docente Kinal',
      pedagogicalSource: reading.pedagogicalSource || 'MINEDUC / Plan Lector Kinal',
      content: reading.content,
      questions: reading.questions && reading.questions.length > 0
        ? JSON.parse(JSON.stringify(reading.questions))
        : [
            {
              id: 'q1',
              prompt: '',
              options: ['', '', '', ''],
              correctIndex: 0,
              explanation: '',
            },
          ],
    };
    this.isReadingModalOpen = true;
    this.cdr.markForCheck();
  }

  closeReadingModal() {
    this.isReadingModalOpen = false;
    this.isEditingReading = false;
    this.editingReadingId = null;
    this.cdr.markForCheck();
  }

  addQuestionToForm() {
    const qNum = this.readingFormData.questions.length + 1;
    this.readingFormData.questions.push({
      id: `q${Date.now()}_${qNum}`,
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    });
    this.cdr.markForCheck();
  }

  removeQuestionFromForm(index: number) {
    if (this.readingFormData.questions.length <= 1) {
      this.showToast('La lectura debe contener al menos una pregunta de comprensión', 'error');
      return;
    }
    this.readingFormData.questions.splice(index, 1);
    this.cdr.markForCheck();
  }

  saveReadingForm() {
    if (!this.readingFormData.title.trim()) {
      this.showToast('Por favor ingresa el título de la lectura', 'error');
      return;
    }
    if (!this.readingFormData.content.trim()) {
      this.showToast('Por favor ingresa el texto de la lectura', 'error');
      return;
    }

    const words = this.readingFormData.content.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    const validQuestions = this.readingFormData.questions.map((q, idx) => ({
      ...q,
      id: q.id || `q_${Date.now()}_${idx}`,
      prompt: q.prompt.trim() || `Pregunta ${idx + 1}`,
      options: q.options.map((opt, i) => opt.trim() || `Opción ${i + 1}`),
    }));

    const payload: Partial<Reading> = {
      title: this.readingFormData.title.trim(),
      level: Number(this.readingFormData.level),
      genre: this.readingFormData.genre.trim(),
      targetWpm: Number(this.readingFormData.targetWpm),
      xpReward: Number(this.readingFormData.xpReward),
      difficulty: this.readingFormData.difficulty,
      author: this.readingFormData.author.trim(),
      pedagogicalSource: this.readingFormData.pedagogicalSource.trim(),
      content: this.readingFormData.content.trim(),
      wordCount,
      questions: validQuestions,
    };

    this.readingModalLoading = true;

    if (this.isEditingReading && this.editingReadingId) {
      this.readingsService.updateReading(this.editingReadingId, payload).subscribe({
        next: () => {
          this.readingModalLoading = false;
          this.closeReadingModal();
          this.showToast('Lectura actualizada exitosamente', 'success');
          this.loadReadings();
        },
        error: (err) => {
          console.error('Error actualizando lectura:', err);
          this.readingModalLoading = false;
          this.showToast('Error al actualizar la lectura en el servidor', 'error');
        },
      });
    } else {
      this.readingsService.createReading(payload).subscribe({
        next: () => {
          this.readingModalLoading = false;
          this.closeReadingModal();
          this.showToast('Nueva lectura agregada exitosamente', 'success');
          this.loadReadings();
        },
        error: (err) => {
          console.error('Error creando lectura:', err);
          this.readingModalLoading = false;
          this.showToast('Error al crear la lectura en el servidor', 'error');
        },
      });
    }
  }

  deleteReading(reading: Reading, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = window.confirm(`¿Confirmas que deseas eliminar la lectura "${reading.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.readingsService.deleteReading(reading.id).subscribe({
      next: () => {
        this.showToast(`Lectura "${reading.title}" eliminada`, 'success');
        this.loadReadings();
      },
      error: (err) => {
        console.error('Error eliminando lectura:', err);
        this.showToast('Error al eliminar la lectura en el servidor', 'error');
      },
    });
  }
}
