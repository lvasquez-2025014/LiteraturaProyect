import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomActivitiesService } from '../../../../core/services/classroom-activities.service';
import {
  ClassroomActivity,
  ClassroomActivityQuestion,
  ClassroomActivitySubmission,
} from '../../../../core/models/classroom-activity.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SpeechRecognitionService } from '../../../../core/services/speech-recognition.service';
import confetti from 'canvas-confetti';

type ActivityPhase = 'LOBBY' | 'READING' | 'QUIZ' | 'RESULTS';

@Component({
  selector: 'app-class-activity-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-activity-view.component.html',
  styleUrl: './class-activity-view.component.css',
})
export class ClassActivityViewComponent implements OnInit, OnDestroy {
  private activityService = inject(ClassroomActivitiesService);
  public auth = inject(AuthService);
  public speechService = inject(SpeechRecognitionService);
  private cdr = inject(ChangeDetectorRef);

  @Input() currentUserGrade?: string;
  @Input() currentUserSection?: string;

  loading = signal<boolean>(true);
  activity = signal<ClassroomActivity | null>(null);
  phase = signal<ActivityPhase>('LOBBY');
  ranking = signal<ClassroomActivitySubmission[]>([]);

  // Temporizador
  timeRemainingSeconds = signal<number>(0);
  totalTimeSeconds = signal<number>(0);
  private timerInterval?: any;
  readingStartTime = 0;
  totalTimeSpentSeconds = 0;

  // Preguntas y respuestas
  currentQuestionIndex = signal<number>(0);
  selectedAnswers: { [questionId: string]: number } = {};
  quizSubmitted = signal<boolean>(false);

  // Métricas del alumno
  finalScore = signal<number>(0);
  finalWpm = signal<number>(0);
  studentRank = signal<number>(1);
  totalClassStudents = signal<number>(1);

  // Reconocimiento de voz
  spokenText = '';
  isMicActive = false;
  wordsSpokenCount = 0;

  // Anti-Cheat & Seguridad Anti-IA
  infractionsCount = signal<number>(0);
  isTabBlurred = signal<boolean>(false);
  securityNotice = signal<string | null>(null);
  private securityNoticeTimeout?: any;

  // Marca de agua dinámica para el estudiante
  watermarkText = computed(() => {
    const u = this.auth.currentUserSignal();
    const name = u?.name || 'Estudiante Kinal';
    const carnet = u?.carnet || u?.email?.split('@')[0] || '2025';
    return `${name} · ${carnet} · ACTIVIDAD EN CLASE`;
  });

  isCheckingLive = signal<boolean>(false);
  private checkPollInterval?: any;

  ngOnInit() {
    this.loadActiveActivity();
    this.startAutoPoll();
  }

  ngOnDestroy() {
    this.stopTimer();
    this.stopSpeechRecognition();
    this.stopAutoPoll();
  }

  startAutoPoll() {
    this.stopAutoPoll();
    this.checkPollInterval = setInterval(() => {
      // Si estamos en LOBBY o no hay actividad, comprobar silenciosamente
      if (!this.activity() || this.phase() === 'LOBBY') {
        this.checkActivitySilently();
      }
    }, 8000);
  }

  stopAutoPoll() {
    if (this.checkPollInterval) {
      clearInterval(this.checkPollInterval);
      this.checkPollInterval = null;
    }
  }

  checkActivitySilently() {
    this.activityService.getActive().subscribe({
      next: (act) => {
        if (act && (!this.activity() || this.activity()?.id !== act.id)) {
          this.activity.set(act);
          if (act.id) this.loadRanking(act.id);
          this.cdr.markForCheck();
        }
      },
      error: () => {},
    });
  }

  loadActiveActivity() {
    this.isCheckingLive.set(true);
    if (!this.activity()) {
      this.loading.set(true);
    }
    this.activityService.getActive().subscribe({
      next: (act) => {
        this.activity.set(act);
        this.loading.set(false);
        this.isCheckingLive.set(false);
        if (act?.id) {
          this.loadRanking(act.id);
          // Verificar si el alumno ya realizó esta actividad
          const currentUserId = this.auth.currentUserSignal()?.id;
          if (currentUserId && act.submissions) {
            const myPrevSubmission = act.submissions.find((s) => s.studentId === currentUserId);
            if (myPrevSubmission) {
              this.finalScore.set(myPrevSubmission.score);
              this.finalWpm.set(myPrevSubmission.wpm);
              this.totalTimeSpentSeconds = myPrevSubmission.timeSpentSeconds;
              this.phase.set('RESULTS');
            }
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.isCheckingLive.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadRanking(activityId: string) {
    this.activityService.getRanking(activityId).subscribe({
      next: (list) => {
        this.ranking.set(list);
        const myId = this.auth.currentUserSignal()?.id;
        const myIndex = list.findIndex((s) => s.studentId === myId);
        if (myIndex >= 0) {
          this.studentRank.set(myIndex + 1);
        }
        this.totalClassStudents.set(list.length);
        this.cdr.markForCheck();
      },
      error: (err) => console.warn('Error ranking:', err),
    });
  }

  startActivity() {
    const act = this.activity();
    if (!act) return;

    this.phase.set('READING');
    this.readingStartTime = Date.now();
    this.totalTimeSeconds.set(act.timeLimitMinutes * 60);
    this.timeRemainingSeconds.set(act.timeLimitMinutes * 60);
    this.infractionsCount.set(0);
    this.selectedAnswers = {};
    this.currentQuestionIndex.set(0);

    this.startTimer();

    if (act.allowMic) {
      this.startSpeechRecognition();
    }
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemainingSeconds() - 1;
      if (remaining <= 0) {
        this.timeRemainingSeconds.set(0);
        this.stopTimer();
        this.onReadingTimerExpired();
      } else {
        this.timeRemainingSeconds.set(remaining);
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startSpeechRecognition() {
    try {
      this.isMicActive = true;
      this.speechService.start();
    } catch (e) {
      console.warn('SpeechRecognition error:', e);
    }
  }

  private stopSpeechRecognition() {
    if (this.isMicActive) {
      try {
        this.speechService.stop();
      } catch (e) {}
      this.isMicActive = false;
    }
  }

  onReadingTimerExpired() {
    this.triggerSecurityAlert('⏱️ ¡Tiempo de lectura finalizado! Pasando a las preguntas de comprensión.');
    this.goToQuestions();
  }

  finishReading() {
    this.goToQuestions();
  }

  goToQuestions() {
    this.stopTimer();
    this.stopSpeechRecognition();
    const timeSpent = Math.max(1, Math.round((Date.now() - this.readingStartTime) / 1000));
    this.totalTimeSpentSeconds = timeSpent;

    const wordCount = this.activity()?.wordCount || 150;
    const minutes = timeSpent / 60;
    this.finalWpm.set(Math.round(wordCount / Math.max(0.2, minutes)));

    this.phase.set('QUIZ');
    this.currentQuestionIndex.set(0);
    this.cdr.markForCheck();
  }

  selectAnswer(questionId: string, optionIndex: number) {
    this.selectedAnswers[questionId] = optionIndex;
    this.cdr.markForCheck();
  }

  nextQuestion() {
    const act = this.activity();
    if (!act) return;
    if (this.currentQuestionIndex() < act.questions.length - 1) {
      this.currentQuestionIndex.update((i) => i + 1);
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((i) => i - 1);
    }
  }

  submitActivity() {
    const act = this.activity();
    if (!act) return;

    let correctCount = 0;
    const questions = act.questions || [];
    questions.forEach((q) => {
      const selected = this.selectedAnswers[q.id];
      if (selected !== undefined && selected === q.correctIndex) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
    this.finalScore.set(score);

    this.quizSubmitted.set(true);

    this.activityService
      .submitAttempt(act.id, {
        score,
        wpm: this.finalWpm(),
        timeSpentSeconds: this.totalTimeSpentSeconds,
        correctAnswersCount: correctCount,
        totalQuestions: questions.length,
        micUsed: act.allowMic,
        infractionsCount: this.infractionsCount(),
      })
      .subscribe({
        next: (res) => {
          this.studentRank.set(res.rank);
          this.totalClassStudents.set(res.totalStudents);
          this.phase.set('RESULTS');
          this.loadRanking(act.id);

          if (score >= 80) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error enviando actividad:', err);
          this.phase.set('RESULTS');
          this.loadRanking(act.id);
          this.cdr.markForCheck();
        },
      });
  }

  // ==========================================
  // ANTI-CHEAT & SEGURIDAD ANTI-IA
  // ==========================================

  @HostListener('window:blur')
  onWindowBlur() {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      this.isTabBlurred.set(true);
      this.infractionsCount.update((c) => c + 1);
      this.triggerSecurityAlert('Cambio de ventana o pestaña detectado. La lectura se oculta por seguridad.');
    }
  }

  @HostListener('window:focus')
  onWindowFocus() {
    this.isTabBlurred.set(false);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.hidden && (this.phase() === 'READING' || this.phase() === 'QUIZ')) {
      this.isTabBlurred.set(true);
      this.infractionsCount.update((c) => c + 1);
      this.triggerSecurityAlert('Cambio de pestaña detectado. Modo seguro activo.');
    } else {
      this.isTabBlurred.set(false);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;

    // Bloquear Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, Ctrl+U, Ctrl+Shift+I, F12
    const isCtrl = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (
      (isCtrl && ['c', 'v', 'a', 'p', 'u', 'x', 's'].includes(key)) ||
      event.key === 'PrintScreen' ||
      event.key === 'F12'
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.triggerSecurityAlert('Acción bloqueada: No se permite copiar texto ni capturar durante la actividad.');
    }
  }

  triggerSecurityAlert(message: string) {
    this.securityNotice.set(message);
    if (this.securityNoticeTimeout) clearTimeout(this.securityNoticeTimeout);
    this.securityNoticeTimeout = setTimeout(() => {
      this.securityNotice.set(null);
      this.cdr.markForCheck();
    }, 4000);
    this.cdr.markForCheck();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getRankBadge(index: number): { emoji: string; label: string; class: string } {
    if (index === 0) return { emoji: '1°', label: '1er Lugar', class: 'rank-gold' };
    if (index === 1) return { emoji: '2°', label: '2do Lugar', class: 'rank-silver' };
    if (index === 2) return { emoji: '3°', label: '3er Lugar', class: 'rank-bronze' };
    return { emoji: `${index + 1}°`, label: `Puesto ${index + 1}`, class: 'rank-standard' };
  }
}
