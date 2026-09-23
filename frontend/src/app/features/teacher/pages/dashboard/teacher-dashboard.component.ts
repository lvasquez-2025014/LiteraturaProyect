import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User, KINAL_GRADE_LEVELS, KINAL_CAREERS, KINAL_SECTIONS, isPeritoGrade } from '../../../../core/models/user.model';
import { StudentPerformance, Reading, Question, RoadmapStage } from '../../../../core/models/reading.model';
import { StudentDetailModalComponent } from '../../components/student-detail-modal/student-detail-modal.component';
import { ReadingsService } from '../../../../core/services/readings.service';
import { StagesService } from '../../../../core/services/stages.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, StudentDetailModalComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css',
})
export class TeacherDashboardComponent implements OnInit {
  readonly gradeLevels = KINAL_GRADE_LEVELS;
  readonly careers = KINAL_CAREERS;
  readonly sections = KINAL_SECTIONS;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  auth = inject(AuthService);
  readingsService = inject(ReadingsService);
  stagesService = inject(StagesService);

  activeTab: 'students' | 'readings' | 'stages' = 'students';

  students: User[] = [];
  loading = false;
  searchQuery = '';
  selectedGrade = 'all';
  selectedCareer = 'all';
  selectedSection = 'all';
  selectedStudentForModal: StudentPerformance | null = null;

  get isBasicoSelected(): boolean {
    return this.selectedGrade !== 'all' && !isPeritoGrade(this.selectedGrade);
  }

  onGradeFilterChange() {
    if (this.isBasicoSelected) {
      this.selectedCareer = 'all';
    }
  }

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
    author: 'Cuerpo Docente',
    pedagogicalSource: 'Plan Lector / Literatura',
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

  get stages(): RoadmapStage[] {
    return this.stagesService.stagesSignal();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab && ['students', 'readings', 'stages'].includes(tab)) {
        this.activeTab = tab as 'students' | 'readings' | 'stages';
        this.cdr.markForCheck();
      }
    });

    this.loadStudents();
    this.loadReadings();
    this.loadStages();
  }

  setTab(tab: 'students' | 'readings' | 'stages') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  loadStages() {
    this.stagesService.getStages().subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Error cargando etapas en Teacher Dashboard:', err);
        this.cdr.markForCheck();
      },
    });
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
      const studentGrade = (student.grade || '').toLowerCase();

      const matchesGrade =
        this.selectedGrade === 'all' ||
        studentGrade.includes(this.selectedGrade.toLowerCase());

      const matchesCareer =
        this.selectedCareer === 'all' ||
        studentGrade.includes(this.selectedCareer.toLowerCase());

      const matchesSection =
        this.selectedSection === 'all' ||
        (student.section && student.section.toUpperCase() === this.selectedSection.toUpperCase());

      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      return matchesGrade && matchesCareer && matchesSection && matchesSearch;
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
    const streak = student.stats?.streakDays || 0;

    const history = student.readingHistory || [];

    // Formatear lecturas recientes reales
    const recentReadings = [...history]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10)
      .map((item) => {
        const itemDate = new Date(item.completedAt);
        const formattedDate = !isNaN(itemDate.getTime())
          ? itemDate.toLocaleDateString('es-GT', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Reciente';

        return {
          title: item.readingTitle || `Lectura de Nivel ${item.readingLevel || 1}`,
          date: formattedDate,
          wpm: item.wpm,
          score: item.comprehensionScore,
        };
      });

    // Construir evolución real semanal / por sesiones
    let weeklyHistory: { week: string; wpm: number; comprehension: number }[] = [];
    if (history.length > 0) {
      const chrono = [...history].sort(
        (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
      );

      if (chrono.length <= 4) {
        weeklyHistory = chrono.map((item, idx) => ({
          week: `Sesión ${idx + 1}`,
          wpm: item.wpm,
          comprehension: item.comprehensionScore,
        }));
      } else {
        const lastFour = chrono.slice(-4);
        weeklyHistory = lastFour.map((item, idx) => {
          const itemDate = new Date(item.completedAt);
          const weekLabel = !isNaN(itemDate.getTime())
            ? itemDate.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
            : `Sesión ${chrono.length - 4 + idx + 1}`;
          return {
            week: weekLabel,
            wpm: item.wpm,
            comprehension: item.comprehensionScore,
          };
        });
      }
    }

    // Tendencia de incremento o variación real
    let trendLabel = 'Sin datos';
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    if (weeklyHistory.length >= 2) {
      const firstWpm = weeklyHistory[0].wpm;
      const lastWpm = weeklyHistory[weeklyHistory.length - 1].wpm;
      const diff = lastWpm - firstWpm;
      if (diff > 0) {
        trendLabel = `▲ +${diff} PPM de avance`;
        trendDirection = 'up';
      } else if (diff < 0) {
        trendLabel = `▼ ${diff} PPM vs inicio`;
        trendDirection = 'down';
      } else {
        trendLabel = `● ${lastWpm} PPM constante`;
        trendDirection = 'neutral';
      }
    } else if (weeklyHistory.length === 1) {
      trendLabel = `● ${weeklyHistory[0].wpm} PPM inicial`;
      trendDirection = 'neutral';
    }

    // Recomendación Pedagógica Real y Dinámica según rendimiento real
    let pedagogicalNote = '';
    if (completed === 0) {
      pedagogicalNote =
        'El estudiante aún no registra lecturas evaluadas en el ciclo. Se sugiere invitarlo a completar su primera lectura del Nivel 1 para calibrar su velocidad inicial y porcentaje de comprensión.';
    } else if (wpm < 110) {
      pedagogicalNote = `Velocidad lectora en desarrollo (${wpm} PPM). Se aconseja priorizar lecturas guiadas en voz alta y ejercicios de articulación para incrementar progresivamente la fluidez hacia la meta institucional de 150 PPM.`;
    } else if (comp < 70) {
      pedagogicalNote = `El estudiante alcanza ${wpm} PPM, pero su comprensión promedio es del ${comp}%. Se recomienda reforzar técnicas de identificación de ideas principales y promover la relectura reflexiva antes de responder las preguntas evaluativas.`;
    } else if (wpm >= 160 && comp >= 85) {
      pedagogicalNote = `Rendimiento sobresaliente (${wpm} PPM y ${comp}% de comprensión). Supera con solidez el estándar institucional. Se sugiere motivarlo con obras de mayor complejidad literaria y análisis crítico.`;
    } else {
      pedagogicalNote = `Ritmo lector consistente (${wpm} PPM con ${comp}% de comprensión). Registra ${streak} día(s) de racha activa. Mantener la regularidad de lecturas para consolidar la retención y la velocidad.`;
    }

    return {
      student,
      averageWpm: wpm,
      comprehensionRate: comp,
      streakDays: streak,
      completedReadings: completed,
      status: this.getStudentStatus(wpm, comp),
      weeklyHistory,
      recentReadings,
      trendLabel,
      trendDirection,
      pedagogicalNote,
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
      author: 'Cuerpo Docente',
      pedagogicalSource: 'Plan Lector / Literatura',
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
      author: reading.author || 'Cuerpo Docente',
      pedagogicalSource: reading.pedagogicalSource || 'Plan Lector / Literatura',
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

  // ==========================================
  // GESTIÓN DE ETAPAS LITERARIAS (Profesor / Admin)
  // ==========================================
  isStageModalOpen = false;
  isEditingStage = false;
  editingStageId: string | number | null = null;
  stageModalLoading = false;

  stageFormData = {
    stageNumber: 1,
    title: '',
    subtitle: '',
    startLevel: 1,
    endLevel: 3,
    description: '',
    themeColor: '#004AAD',
    badge: '',
    rewardXp: 300,
    rewardCoins: 120,
    milestoneTitle: '',
  };

  readonly stageColorPresets = [
    { name: 'Azul Cobalto', value: '#004AAD' },
    { name: 'Esmeralda', value: '#059669' },
    { name: 'Ámbar', value: '#D97706' },
    { name: 'Púrpura', value: '#7C3AED' },
    { name: 'Rojo Carmesí', value: '#DC2626' },
    { name: 'Cian Océano', value: '#0891B2' },
    { name: 'Rosa Fucsia', value: '#DB2777' },
  ];

  openCreateStageModal() {
    this.isEditingStage = false;
    this.editingStageId = null;
    const stagesList = this.stages;
    const nextNum = stagesList.length > 0 ? Math.max(...stagesList.map((s) => s.stageNumber || s.id || 0)) + 1 : 1;
    const lastStage = stagesList.length > 0 ? stagesList[stagesList.length - 1] : null;
    const startLvl = lastStage ? lastStage.endLevel + 1 : 1;
    const endLvl = startLvl + 4;

    this.stageFormData = {
      stageNumber: nextNum,
      title: `Etapa ${nextNum}: `,
      subtitle: `Niveles ${startLvl} al ${endLvl}`,
      startLevel: startLvl,
      endLevel: endLvl,
      description: '',
      themeColor: this.stageColorPresets[(nextNum - 1) % this.stageColorPresets.length].value,
      badge: `Maestro Etapa ${nextNum}`,
      rewardXp: 500,
      rewardCoins: 200,
      milestoneTitle: `Gran Cofre de la Etapa ${nextNum}`,
    };
    this.isStageModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditStageModal(stage: RoadmapStage, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isEditingStage = true;
    this.editingStageId = stage._id || stage.id;
    this.stageFormData = {
      stageNumber: stage.stageNumber || stage.id || 1,
      title: stage.title,
      subtitle: stage.subtitle || '',
      startLevel: stage.startLevel,
      endLevel: stage.endLevel,
      description: stage.description || '',
      themeColor: stage.themeColor || '#004AAD',
      badge: stage.badge || '',
      rewardXp: stage.rewardXp || 250,
      rewardCoins: stage.rewardCoins || 100,
      milestoneTitle: stage.milestoneTitle || '',
    };
    this.isStageModalOpen = true;
    this.cdr.markForCheck();
  }

  closeStageModal() {
    this.isStageModalOpen = false;
    this.isEditingStage = false;
    this.editingStageId = null;
    this.cdr.markForCheck();
  }

  saveStage() {
    if (!this.stageFormData.title.trim()) {
      this.showToast('El título de la etapa es obligatorio', 'error');
      return;
    }
    if (this.stageFormData.startLevel > this.stageFormData.endLevel) {
      this.showToast('El nivel inicial no puede ser mayor al nivel final', 'error');
      return;
    }

    this.stageModalLoading = true;
    const totalLevels = Math.max(1, this.stageFormData.endLevel - this.stageFormData.startLevel + 1);
    const payload: Partial<RoadmapStage> = {
      stageNumber: Number(this.stageFormData.stageNumber),
      title: this.stageFormData.title.trim(),
      subtitle: this.stageFormData.subtitle.trim() || `Niveles ${this.stageFormData.startLevel} al ${this.stageFormData.endLevel}`,
      startLevel: Number(this.stageFormData.startLevel),
      endLevel: Number(this.stageFormData.endLevel),
      totalLevels,
      description: this.stageFormData.description.trim(),
      themeColor: this.stageFormData.themeColor || '#004AAD',
      badge: this.stageFormData.badge.trim() || 'Gran Lector',
      rewardXp: Number(this.stageFormData.rewardXp) || 250,
      rewardCoins: Number(this.stageFormData.rewardCoins) || 100,
      milestoneTitle: this.stageFormData.milestoneTitle.trim() || `Cofre de la Etapa ${this.stageFormData.stageNumber}`,
    };

    if (this.isEditingStage && this.editingStageId !== null) {
      this.stagesService.updateStage(this.editingStageId, payload).subscribe({
        next: () => {
          this.stageModalLoading = false;
          this.closeStageModal();
          this.showToast('Etapa pedagógica actualizada exitosamente', 'success');
          this.loadStages();
        },
        error: (err) => {
          console.error('Error actualizando etapa:', err);
          this.stageModalLoading = false;
          this.showToast('Error al actualizar la etapa en el servidor', 'error');
        },
      });
    } else {
      this.stagesService.createStage(payload).subscribe({
        next: () => {
          this.stageModalLoading = false;
          this.closeStageModal();
          this.showToast('Nueva etapa pedagógica creada exitosamente', 'success');
          this.loadStages();
        },
        error: (err) => {
          console.error('Error creando etapa:', err);
          this.stageModalLoading = false;
          this.showToast('Error al crear la etapa en el servidor', 'error');
        },
      });
    }
  }

  deleteStage(stage: RoadmapStage, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = window.confirm(`¿Confirmas que deseas eliminar la etapa "${stage.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    const idToDelete = stage._id || stage.id;
    this.stagesService.deleteStage(idToDelete).subscribe({
      next: () => {
        this.showToast(`Etapa "${stage.title}" eliminada`, 'success');
        this.loadStages();
      },
      error: (err) => {
        console.error('Error eliminando etapa:', err);
        this.showToast('Error al eliminar la etapa en el servidor', 'error');
      },
    });
  }
}
