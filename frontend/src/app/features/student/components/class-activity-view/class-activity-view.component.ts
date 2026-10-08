import {
  Component,
  Input,
  Output,
  EventEmitter,
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
import {
  CognitiveLevel,
  CognitiveLevelInfo,
  COGNITIVE_LEVELS_META,
} from '../../../../core/models/reading.model';
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
  @Input() currentUserCareer?: string;
  @Output() activityInProgress = new EventEmitter<boolean>();

  loading = signal<boolean>(true);
  activity = signal<ClassroomActivity | null>(null);
  phase = signal<ActivityPhase>('LOBBY');
  ranking = signal<ClassroomActivitySubmission[]>([]);

  // Anti-Screenshot Blackout
  isBlackoutActive = signal<boolean>(false);
  private blackoutTimeout?: any;

  // Temporizador
  timeRemainingSeconds = signal<number>(0);
  totalTimeSeconds = signal<number>(0);
  private timerInterval?: any;
  readingStartTime = 0;
  totalTimeSpentSeconds = 0;

  // Preguntas y respuestas
  readonly cognitiveMeta = COGNITIVE_LEVELS_META;
  currentQuestionIndex = signal<number>(0);
  selectedAnswers: { [questionId: string]: number } = {};
  quizSubmitted = signal<boolean>(false);

  getCognitiveInfo(q?: ClassroomActivityQuestion, fallbackIndex = 0): CognitiveLevelInfo {
    const level: CognitiveLevel = q?.cognitiveLevel || (fallbackIndex % 3 === 0 ? 'literal' : fallbackIndex % 3 === 1 ? 'inferencial' : 'critico');
    return COGNITIVE_LEVELS_META[level];
  }

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
    const name = u?.name || 'Estudiante';
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
    this.clearBlackout();
    this.activityInProgress.emit(false);
    this.stopTimer();
    this.stopSpeechRecognition();
    this.stopAutoPoll();
    if (this.securityNoticeTimeout) {
      clearTimeout(this.securityNoticeTimeout);
      this.securityNoticeTimeout = null;
    }
    if (this.blackoutTimeout) {
      clearTimeout(this.blackoutTimeout);
      this.blackoutTimeout = null;
    }
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
              this.clearBlackout();
              this.activityInProgress.emit(false);
            }
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.isCheckingLive.set(false);
        this.clearBlackout();
        this.activityInProgress.emit(false);
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
    try {
      history.pushState(null, '', window.location.href);
    } catch (e) {}
    this.activityInProgress.emit(true);
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
    this.activityInProgress.emit(true);
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
          this.clearBlackout();
          this.activityInProgress.emit(false);
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
          this.clearBlackout();
          this.activityInProgress.emit(false);
          this.loadRanking(act.id);
          this.cdr.markForCheck();
        },
      });
  }

  // ==========================================
  // ANTI-CHEAT & SEGURIDAD ANTI-IA & ANTI-CAPTURA (PC Y TELÉFONO)
  // ==========================================

  overwriteClipboardWithBlack() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1920, 1080);
        canvas.toBlob((blob) => {
          if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).catch(() => {});
          }
        }, 'image/png');
      }
    } catch (e) {}

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    } catch (e) {}
  }

  triggerBlackout() {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;
    this.isBlackoutActive.set(true);
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('screenshot-blackout-active');
    }
    this.overwriteClipboardWithBlack();
    this.cdr.markForCheck();
  }

  clearBlackout() {
    this.isBlackoutActive.set(false);
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('screenshot-blackout-active');
    }
    this.cdr.markForCheck();
  }

  resumeFromBlackout() {
    this.clearBlackout();
    this.isTabBlurred.set(false);
    this.overwriteClipboardWithBlack();
    this.triggerSecurityAlert('Actividad reanudada. Recuerda que no se permiten capturas de pantalla.');
  }

  @HostListener('window:blur')
  onWindowBlur() {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      this.infractionsCount.update((c) => c + 1);
      this.triggerBlackout();
      this.isTabBlurred.set(true);
    }
  }

  @HostListener('window:focus')
  onWindowFocus() {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      // Al recuperar el foco, asegurarse de que el portapapeles siga sobreescrito en negro
      this.overwriteClipboardWithBlack();
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.hidden) {
      this.stopAutoPoll();
      if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
        this.infractionsCount.update((c) => c + 1);
        this.triggerBlackout();
        this.isTabBlurred.set(true);
      }
    } else {
      this.startAutoPoll();
      if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
        this.overwriteClipboardWithBlack();
      } else {
        this.clearBlackout();
        this.isTabBlurred.set(false);
        if (!this.activity() || this.phase() === 'LOBBY') {
          this.checkActivitySilently();
        }
      }
    }
  }

  // Intercepción para teléfonos: gestos de captura de 3 dedos (Xiaomi, Samsung, Realme, Oppo)
  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;
    if (event.touches && event.touches.length >= 3) {
      event.preventDefault();
      event.stopPropagation();
      this.infractionsCount.update((c) => c + 1);
      this.triggerBlackout();
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;
    if (event.touches && event.touches.length >= 3) {
      event.preventDefault();
      event.stopPropagation();
      this.triggerBlackout();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;

    const isCtrl = event.ctrlKey || event.metaKey;
    const key = event.key ? event.key.toLowerCase() : '';
    const code = event.code || '';

    // Si la pantalla negra está activa, permitir reanudar con Enter, Escape o Barra espaciadora
    if (this.isBlackoutActive()) {
      if (['enter', 'escape', ' ', 'space'].includes(key)) {
        event.preventDefault();
        this.resumeFromBlackout();
        return;
      }
    }

    // Detección directa de cualquier tecla de captura o sistema:
    // - PrintScreen
    // - Tecla Windows / Meta (para interceptar Win+Shift+S antes de que termine)
    // - Atajos de recorte (Shift+S, Shift+3, Shift+4)
    // - Bloquear copiar, pegar, imprimir, guardar, inspeccionar
    if (
      event.key === 'PrintScreen' ||
      code === 'PrintScreen' ||
      event.key === 'Meta' ||
      code === 'MetaLeft' ||
      code === 'MetaRight' ||
      (event.shiftKey && (key === 's' || key === '3' || key === '4')) ||
      (isCtrl && (key === 'p' || key === 's' || key === 'u' || key === 'c' || key === 'v' || key === 'x')) ||
      (isCtrl && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
      event.key === 'F12'
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.triggerBlackout();
      return;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.phase() !== 'READING' && this.phase() !== 'QUIZ') return;
    const code = event.code || '';
    if (
      event.key === 'PrintScreen' ||
      code === 'PrintScreen' ||
      event.key === 'Meta' ||
      code === 'MetaLeft' ||
      code === 'MetaRight'
    ) {
      this.triggerBlackout();
    }
  }

  @HostListener('window:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      event.preventDefault();
      this.triggerSecurityAlert('El menú contextual está deshabilitado durante la actividad en clase.');
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      try {
        history.pushState(null, '', window.location.href);
      } catch (e) {}
      this.triggerSecurityAlert('⚠️ Evaluación en curso: No puedes salir de la actividad hasta completarla y entregarla.');
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.phase() === 'READING' || this.phase() === 'QUIZ') {
      event.preventDefault();
      event.returnValue = 'Tienes una actividad en clase en curso. Si sales ahora se perderá tu intento.';
      return event.returnValue;
    }
    return undefined;
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
