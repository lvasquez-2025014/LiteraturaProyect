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
  assistedSpeedMultiplier = 1.0;

  get currentTargetWpm(): number {
    return this.mode === 'assisted'
      ? Math.round(this.reading.targetWpm * this.assistedSpeedMultiplier)
      : this.reading.targetWpm;
  }

  setAssistedSpeed(multiplier: number): void {
    this.assistedSpeedMultiplier = multiplier;
    this.speechService.setAssistedSpeedMultiplier(multiplier);
  }

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

    this.speechService.onWordsUpdated = (spokenWords, wpm, activeTokens, candidateAlts, utteranceId) => {
      if (this.mode === 'mic') {
        this.processSpokenTokens(spokenWords || [], candidateAlts || []);
      }
      this.updateLiveWpm();
      this.cdr.detectChanges();
    };
  }

  private matchedSpokenIndex = 0;

  ngOnDestroy(): void {
    this.stopTimer();
    this.speechService.stop();
    this.speechService.stopNarrator();
  }

  /**
   * Motor de coincidencia fonética y alineación monótona de ultra-alta precisión.
   * Procesa palabra por palabra en estricto orden secuencial rastreando la posición
   * monótona del flujo continuo de voz (`matchedSpokenIndex`) frente al texto de lectura (`currentWordIndex`).
   * Garantiza que cuando el alumno dice una palabra ("en"), se verifica que coincida con la palabra
   * objetivo actual ("en") antes de avanzar a la siguiente ("los").
   */
  private processSpokenTokens(spokenWords: string[], candidateAlts?: string[]): void {
    if (this.currentWordIndex >= this.totalWords || !spokenWords || spokenWords.length === 0) return;

    if (this.matchedSpokenIndex > spokenWords.length) {
      this.matchedSpokenIndex = spokenWords.length;
    }

    let advanced = false;
    const initialIndex = this.currentWordIndex;
    const FILLERS = new Set(['eh', 'este', 'em', 'emm', 'ah', 'hum', 'um', 'uh', 'bueno', 'osea']);

    while (this.matchedSpokenIndex < spokenWords.length && this.currentWordIndex < this.totalWords) {
      const token = spokenWords[this.matchedSpokenIndex];
      const target = this.words[this.currentWordIndex];
      const normToken = normalizeSpanishWord(token);
      const normTarget = normalizeSpanishWord(target);

      // 1. Filtrar muletillas, ruidos breves o titubeos iniciales ("eh", "um", "ah", "hum")
      if (FILLERS.has(normToken) && normTarget !== 'este') {
        this.matchedSpokenIndex++;
        continue;
      }

      // 2. Coincidencia directa fonética y ortográfica (máxima precisión con tildes, números y pronunciación guatemalteca)
      if (isPhoneticMatch(token, target)) {
        this.currentWordIndex++;
        this.matchedSpokenIndex++;
        advanced = true;
        continue;
      }

      // 2b. Evaluación de hipótesis alternativas devueltas por el reconocedor de voz (maxAlternatives)
      if (candidateAlts && candidateAlts.length > 0) {
        let altMatched = false;
        for (const alt of candidateAlts) {
          if (isPhoneticMatch(alt, target)) {
            this.currentWordIndex++;
            this.matchedSpokenIndex++;
            advanced = true;
            altMatched = true;
            break;
          }
        }
        if (altMatched) continue;
      }

      // 3. Sinalefa (dos palabras leídas juntas de corrido: "a las" -> "alas", "de el" -> "del", "de la" -> "dela")
      if (this.currentWordIndex + 1 < this.totalWords) {
        const nextTarget = this.words[this.currentWordIndex + 1];
        const combinedTarget = target + nextTarget;
        const normNextTarget = normalizeSpanishWord(nextTarget);

        if (
          isPhoneticMatch(token, combinedTarget) ||
          isPhoneticMatch(token, `${target} ${nextTarget}`) ||
          (normToken === 'del' && normTarget === 'de' && normNextTarget === 'el') ||
          (normToken === 'al' && normTarget === 'a' && normNextTarget === 'el')
        ) {
          this.currentWordIndex += 2;
          this.matchedSpokenIndex++;
          advanced = true;
          continue;
        }
      }

      // 4. Palabra compuesta o tildada dividida en dos tokens por el micrófono (e.g. "tan", "bien" -> "también")
      if (this.matchedSpokenIndex + 1 < spokenWords.length) {
        const combinedSpoken = token + spokenWords[this.matchedSpokenIndex + 1];
        if (isPhoneticMatch(combinedSpoken, target)) {
          this.currentWordIndex++;
          this.matchedSpokenIndex += 2;
          advanced = true;
          continue;
        }
      }

      // 5. Relectura de la palabra anterior (el alumno repite una palabra previa para autocorregirse: "el... el")
      if (this.currentWordIndex > 0 && isPhoneticMatch(token, this.words[this.currentWordIndex - 1])) {
        this.matchedSpokenIndex++;
        continue;
      }

      // 6. Lookahead en tokens hablados: si este token fue un ruido o chasquido pero el siguiente coincide con la palabra actual
      if (
        this.matchedSpokenIndex + 1 < spokenWords.length &&
        isPhoneticMatch(spokenWords[this.matchedSpokenIndex + 1], target)
      ) {
        this.currentWordIndex++;
        this.matchedSpokenIndex += 2;
        advanced = true;
        continue;
      }

      // 7. Confirmación de flujo continuo por ventana multi-token (Lookahead de recuperación):
      // Si la palabra actual tuvo una distorsión acústica que no encajó al 100%, pero el alumno
      // continuó su lectura y el siguiente token coincide con la palabra posterior del texto (ej. "de" con "de",
      // y preferentemente "la" con "la"):
      if (
        this.matchedSpokenIndex + 1 < spokenWords.length &&
        this.currentWordIndex + 1 < this.totalWords &&
        isPhoneticMatch(spokenWords[this.matchedSpokenIndex + 1], this.words[this.currentWordIndex + 1])
      ) {
        const nextTarget = this.words[this.currentWordIndex + 1];
        const normNextTarget = normalizeSpanishWord(nextTarget);

        const hasThirdTokenConfirmation =
          this.matchedSpokenIndex + 2 < spokenWords.length &&
          this.currentWordIndex + 2 < this.totalWords &&
          isPhoneticMatch(spokenWords[this.matchedSpokenIndex + 2], this.words[this.currentWordIndex + 2]);

        const hasPhoneticAffinity =
          normToken.length >= 3 &&
          (normToken[0] === normTarget[0] ||
            normToken.endsWith(normTarget.slice(-2)) ||
            normToken.includes(normTarget.slice(0, 3)));

        // Si se confirma por 3er token consecutivo, afinidad acústica con la palabra objetivo, o la siguiente palabra es de contenido
        if (hasThirdTokenConfirmation || hasPhoneticAffinity || normNextTarget.length >= 4) {
          this.currentWordIndex += 2;
          this.matchedSpokenIndex += 2;
          advanced = true;
          continue;
        }
      }

      // 8. Lookahead en texto objetivo: si el alumno se saltó 1 palabra o preposición corta y dijo la siguiente
      if (
        this.currentWordIndex + 1 < this.totalWords &&
        isPhoneticMatch(token, this.words[this.currentWordIndex + 1])
      ) {
        this.currentWordIndex += 2;
        this.matchedSpokenIndex++;
        advanced = true;
        continue;
      }

      // 9. Descarte de token de ruido si un token dentro de los próximos 2 coincide con el target actual
      if (
        this.matchedSpokenIndex + 2 < spokenWords.length &&
        isPhoneticMatch(spokenWords[this.matchedSpokenIndex + 2], target)
      ) {
        this.matchedSpokenIndex++;
        continue;
      }

      // 10. Prevención de bloqueo por acumulación de ruido:
      // Si hay 3 o más tokens hablados sin consumir acumulados, descartar el más antiguo para permitir que el flujo avance
      if (spokenWords.length - this.matchedSpokenIndex >= 3) {
        this.matchedSpokenIndex++;
        continue;
      }

      // Detener este ciclo de procesamiento para esperar nuevo audio
      break;
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

    if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
      this.finishReading();
    }
  }

  private scrollToCurrentWord(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const currentEl = document.querySelector('.word-current') as HTMLElement | null;
      if (!currentEl) return;
      const rect = currentEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // Desplazamiento suave únicamente si la palabra activa se acerca al límite inferior o superior visible
      if (rect.bottom > viewportHeight - 160 || rect.top < 120) {
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
    this.matchedSpokenIndex = 0;
    this.startTimer();

    if (this.mode === 'mic') {
      const started = this.speechService.start();
      if (!started && !this.speechService.isSupported()) {
        this.mode = 'assisted';
        this.speechService.setAssistedSpeedMultiplier(this.assistedSpeedMultiplier);
        this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
          this.currentWordIndex = idx;
          this.updateLiveWpm();
          if (this.currentWordIndex >= this.totalWords) {
            this.finishReading();
          }
          this.cdr.detectChanges();
        });
      }
    } else {
      this.speechService.setAssistedSpeedMultiplier(this.assistedSpeedMultiplier);
      this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
        this.currentWordIndex = idx;
        this.updateLiveWpm();
        if (this.currentWordIndex >= this.totalWords) {
          this.finishReading();
        }
        this.cdr.detectChanges();
      });
    }
  }

  updateLiveWpm(): void {
    if (this.secondsElapsed <= 0 || this.currentWordIndex <= 0) {
      this.currentWpm = 0;
      return;
    }
    const raw = Math.round((this.currentWordIndex / this.secondsElapsed) * 60);
    this.currentWpm = Math.min(450, Math.max(0, raw));
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
    this.matchedSpokenIndex = 0;
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
    // Durante la lectura activa por voz, los clics del ratón o selecciones de texto NUNCA deben marcar palabras como leídas
    if (this.isRecording) {
      return;
    }

    // Buscar si la palabra tiene definición en el vocabulario pedagógico (solo cuando no se está leyendo)
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
      this.secondsElapsed > 0 && this.currentWordIndex > 0
        ? Math.round((this.currentWordIndex / this.secondsElapsed) * 60)
        : (this.currentWpm > 0 ? this.currentWpm : this.currentTargetWpm);

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
      this.updateLiveWpm();
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
