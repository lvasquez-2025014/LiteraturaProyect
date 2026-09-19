import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading, ReadingAttemptResult } from '../../../../core/models/reading.model';
import {
  SpeechRecognitionService,
  isPhoneticMatch,
  normalizeSpanishWord,
} from '../../../../core/services/speech-recognition.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-reading-reader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reading-reader.component.html',
  styleUrl: './reading-reader.component.css',
})
export class ReadingReaderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) reading!: Reading;
  @Input() studentId: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() completeAttempt = new EventEmitter<ReadingAttemptResult>();

  public speechService = inject(SpeechRecognitionService);
  private cdr = inject(ChangeDetectorRef);

  words: string[] = [];
  totalWords = 0;

  isRecording = false;
  isPaused = false;
  currentWordIndex = 0;
  secondsElapsed = 0;
  currentWpm = 0;
  transcript = '';
  micError: string | null = null;
  mode: 'mic' | 'assisted' = 'mic';

  // Modo de visualización: Progresivo (teleprompter móvil amigable) o Texto Completo
  readingMode: 'progressive' | 'full' = 'progressive';

  // Opciones de Accesibilidad y Pedagogía
  fontSize: 'normal' | 'large' | 'xlarge' = 'normal';
  focusMode = false;
  soundEffects = true;

  // Narración Pedagógica ("Escuchar Lectura Modelo")
  isNarrating = false;
  narratorRate = 1.0;

  // Glosario / Vocabulario interactivo
  activeVocabModal: { word: string; meaning: string } | null = null;

  // Quiz & Victoria
  showQuiz = false;
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  showExplanation = false;
  quizScore = 0;
  showVictory = false;
  finalResult: ReadingAttemptResult | null = null;

  private timerInterval: any = null;

  ngOnInit(): void {
    this.words = this.reading.content.trim().split(/\s+/);
    this.totalWords = this.words.length;
    this.selectedAnswers = new Array(this.reading.questions.length).fill(-1);

    this.speechService.onStateChange = (state) => {
      this.isRecording = state.isListening && !state.isPaused;
      this.isPaused = state.isPaused;
      this.transcript = state.transcript;
      if (state.error) {
        this.micError = state.error;
      }
      this.cdr.detectChanges();
    };

    this.speechService.onWordsUpdated = (spokenWords, wpm, recentPhrase, candidateAlts) => {
      this.currentWpm = wpm;
      this.processSpokenWords(spokenWords, recentPhrase, candidateAlts);
      this.cdr.detectChanges();
    };
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.speechService.stop();
    this.speechService.stopNarrator();
  }

  /**
   * Determina si una palabra debe renderizarse según el modo de visualización.
   * En modo progresivo:
   * - Antes de iniciar la lectura: se muestra solo un adelanto inicial (~18 palabras)
   *   para que el usuario no tenga que hacer scroll interminable en teléfono.
   * - Al iniciar la lectura: se revelan las palabras leídas + un buffer de 14 palabras
   *   a futuro que van apareciendo progresivamente a medida que el alumno lee.
   */
  isWordVisible(index: number): boolean {
    if (this.readingMode === 'full') {
      return true;
    }
    const hasStarted = this.isRecording || this.isPaused || this.secondsElapsed > 0;
    if (!hasStarted) {
      return index < 18;
    }
    return index <= this.currentWordIndex + 14;
  }

  toggleReadingMode(): void {
    this.readingMode = this.readingMode === 'progressive' ? 'full' : 'progressive';
  }

  /**
   * Motor de coincidencia fonética secuencial de alta precisión.
   * Procesa palabra por palabra garantizando que el avance sea fiel a la voz del lector.
   * Soporta tildes diacríticas (é, á, í, ó, ú), sinalefas y auto-desplazamiento.
   */
  private processSpokenWords(
    spokenWords: string[],
    recentPhrase?: string,
    candidateAlts?: string[]
  ): void {
    if (!spokenWords || spokenWords.length === 0 || this.currentWordIndex >= this.totalWords) return;

    // Tokens primarios reconocidos de la frase en curso
    const primaryTokens: string[] = recentPhrase && recentPhrase.trim().length > 0
      ? recentPhrase.trim().split(/\s+/).filter(Boolean)
      : spokenWords.slice(Math.max(0, spokenWords.length - 2));

    if (primaryTokens.length === 0) return;

    let advanced = false;
    const initialIndex = this.currentWordIndex;

    // 1. Coincidencia secuencial estricta sobre la palabra activa
    for (let tIdx = 0; tIdx < primaryTokens.length; tIdx++) {
      if (this.currentWordIndex >= this.totalWords) break;

      const token = primaryTokens[tIdx];
      const currentTarget = this.words[this.currentWordIndex];

      // Coincidencia directa fonética u ortográfica
      if (isPhoneticMatch(token, currentTarget)) {
        this.currentWordIndex++;
        advanced = true;
        continue;
      }

      // Verificación de sinalefa (dos palabras unidas por el habla fluida: "a las" -> "alas", "de el" -> "del")
      if (this.currentWordIndex + 1 < this.totalWords) {
        const combinedTarget = currentTarget + this.words[this.currentWordIndex + 1];
        if (isPhoneticMatch(token, combinedTarget)) {
          this.currentWordIndex += 2;
          advanced = true;
          continue;
        }
      }

      // Verificación de palabra compuesta dividida en dos tokens hablados (e.g. "tan", "bien" -> "también")
      if (tIdx + 1 < primaryTokens.length) {
        const combinedSpoken = token + primaryTokens[tIdx + 1];
        if (isPhoneticMatch(combinedSpoken, currentTarget)) {
          this.currentWordIndex++;
          advanced = true;
          tIdx++; // Consumir siguiente token
          continue;
        }
      }
    }

    // 2. Si no avanzó con el token principal, verificar alternativas directas del reconocedor
    // para capturar instantáneamente palabras cortas o tildadas (e.g. "él", "sé", "té", "dé", "qué", "fértil")
    if (!advanced && candidateAlts && candidateAlts.length > 0 && this.currentWordIndex < this.totalWords) {
      const currentTarget = this.words[this.currentWordIndex];
      for (const altToken of candidateAlts) {
        if (isPhoneticMatch(altToken, currentTarget)) {
          this.currentWordIndex++;
          advanced = true;
          break;
        }
      }
    }

    if (advanced && this.currentWordIndex > initialIndex) {
      const prevPercentage = Math.floor((initialIndex / this.totalWords) * 100);
      const newPercentage = Math.floor((this.currentWordIndex / this.totalWords) * 100);

      this.scrollToCurrentWord();

      if (this.soundEffects) {
        this.speechService.playWordChime();
        if (
          (prevPercentage < 25 && newPercentage >= 25) ||
          (prevPercentage < 50 && newPercentage >= 50) ||
          (prevPercentage < 75 && newPercentage >= 75)
        ) {
          this.speechService.playMilestoneSound();
        }
      }
    }

    // Al completar la totalidad de las palabras, abrir el cuestionario pedagógico
    if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
      this.finishReading();
    }
  }

  private scrollToCurrentWord(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const currentEl = document.querySelector('.word-current');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, 10);
  }

  startReading(): void {
    this.stopNarrator();
    this.micError = null;
    this.currentWordIndex = 0;
    this.secondsElapsed = 0;
    this.currentWpm = 0;
    this.startTimer();

    if (this.mode === 'mic') {
      const started = this.speechService.start();
      if (!started && !this.speechService.isSupported()) {
        this.mode = 'assisted';
        this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
          this.currentWordIndex = idx;
          if (this.currentWordIndex >= this.totalWords) {
            this.finishReading();
          }
          this.cdr.detectChanges();
        });
      }
    } else {
      this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
        this.currentWordIndex = idx;
        if (this.currentWordIndex >= this.totalWords) {
          this.finishReading();
        }
        this.cdr.detectChanges();
      });
    }
  }

  pauseReading(): void {
    this.stopTimer();
    this.speechService.pause();
  }

  resumeReading(): void {
    this.startTimer();
    this.speechService.resume();
  }

  restartReading(): void {
    this.stopTimer();
    this.speechService.stop();
    this.stopNarrator();
    this.currentWordIndex = 0;
    this.secondsElapsed = 0;
    this.currentWpm = 0;
    this.isRecording = false;
    this.isPaused = false;
    this.micError = null;
  }

  finishReading(): void {
    this.stopTimer();
    this.speechService.stop();
    this.stopNarrator();
    this.currentWordIndex = this.totalWords;

    // Abrir inmediatamente el cuestionario de comprensión
    this.showQuiz = true;
    this.currentQuestionIndex = 0;
    this.cdr.detectChanges();
  }

  /* =========================================================================
   * ACCESIBILIDAD, TAMAÑO DE TEXTO Y MODO ENFOQUE
   * ========================================================================= */

  increaseFontSize(): void {
    if (this.fontSize === 'normal') this.fontSize = 'large';
    else if (this.fontSize === 'large') this.fontSize = 'xlarge';
  }

  decreaseFontSize(): void {
    if (this.fontSize === 'xlarge') this.fontSize = 'large';
    else if (this.fontSize === 'large') this.fontSize = 'normal';
  }

  toggleFocusMode(): void {
    this.focusMode = !this.focusMode;
  }

  toggleSoundEffects(): void {
    this.soundEffects = !this.soundEffects;
    this.speechService.soundEffectsEnabled = this.soundEffects;
  }

  isWordInFocus(index: number): boolean {
    if (!this.focusMode || !this.isRecording) return true;
    // Ilumina una ventana de 6 palabras alrededor de la palabra activa
    return Math.abs(index - this.currentWordIndex) <= 6;
  }

  /* =========================================================================
   * LECTURA MODELO GUIADA (SpeechSynthesis)
   * ========================================================================= */

  toggleNarrator(): void {
    if (this.isNarrating) {
      this.stopNarrator();
    } else {
      this.isNarrating = true;
      if (this.isRecording) {
        this.pauseReading();
      }

      this.speechService.playNarrator(
        this.reading.content,
        this.narratorRate,
        (charIndex) => {
          // Aproximar avance de palabra durante la narración modelo
          const textBefore = this.reading.content.substring(0, charIndex);
          const wordCount = textBefore.trim().split(/\s+/).filter(Boolean).length;
          this.currentWordIndex = Math.min(this.totalWords, wordCount);
          this.cdr.detectChanges();
        },
        () => {
          this.isNarrating = false;
          this.cdr.detectChanges();
        }
      );
    }
  }

  setNarratorRate(rate: number): void {
    this.narratorRate = rate;
    if (this.isNarrating) {
      this.toggleNarrator(); // reiniciar con nueva velocidad
      this.toggleNarrator();
    }
  }

  stopNarrator(): void {
    this.isNarrating = false;
    this.speechService.stopNarrator();
  }

  /* =========================================================================
   * GLOSARIO Y VOCABULARIO
   * ========================================================================= */

  onWordClick(rawWord: string, index: number): void {
    // Si el estudiante hace clic en una palabra y la lectura está activa, permite saltar a ella
    if (this.isRecording) {
      this.currentWordIndex = index;
      return;
    }

    // Buscar si la palabra tiene definición en el vocabulario pedagógico
    const clean = normalizeSpanishWord(rawWord);
    if (this.reading.vocabulary) {
      const found = this.reading.vocabulary.find(
        (v) => normalizeSpanishWord(v.word) === clean || clean.includes(normalizeSpanishWord(v.word))
      );
      if (found) {
        this.openVocab(found);
      }
    }
  }

  openVocab(v: { word: string; meaning: string }): void {
    this.activeVocabModal = v;
  }

  closeVocab(): void {
    this.activeVocabModal = null;
  }

  /* =========================================================================
   * CUESTIONARIO Y CELEBRACIÓN DE VICTORIA
   * ========================================================================= */

  selectQuizOption(optIdx: number): void {
    if (this.showExplanation) return;
    this.selectedAnswers[this.currentQuestionIndex] = optIdx;
    this.showExplanation = true;
  }

  nextQuestion(): void {
    this.showExplanation = false;
    if (this.currentQuestionIndex < this.reading.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.calculateFinalResults();
    }
  }

  calculateFinalResults(): void {
    this.showQuiz = false;

    // Calcular puntaje de comprensión
    let correctCount = 0;
    this.reading.questions.forEach((q, idx) => {
      if (this.selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    this.quizScore = Math.round((correctCount / this.reading.questions.length) * 100);

    const calculatedWpm =
      this.currentWpm > 0 ? this.currentWpm : Math.round((this.totalWords / Math.max(1, this.secondsElapsed)) * 60);

    this.finalResult = {
      readingId: this.reading.id,
      studentId: this.studentId,
      wpm: calculatedWpm,
      accuracy: this.quizScore,
      timeSeconds: this.secondsElapsed,
      comprehensionScore: this.quizScore,
      xpEarned: this.reading.xpReward,
      date: new Date().toISOString(),
    };

    this.showVictory = true;

    // Fanfarria sonora y lluvia de confeti
    if (this.soundEffects) {
      this.speechService.playVictoryFanfare();
    }
    this.triggerVictoryConfetti();
  }

  triggerVictoryConfetti(): void {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#004AAD', '#F36F21', '#1C2D5A', '#E8EEFF', '#10B981'],
      });
    } catch (e) {}
  }

  onVictoryContinue(): void {
    this.showVictory = false;
    if (this.finalResult) {
      this.completeAttempt.emit(this.finalResult);
    }
    this.back.emit();
    this.cdr.detectChanges();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.totalWords) return 0;
    return Math.min(100, Math.round((this.currentWordIndex / this.totalWords) * 100));
  }
}
