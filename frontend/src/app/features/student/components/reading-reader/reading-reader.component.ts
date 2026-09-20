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
      this.currentWpm = wpm;
      this.processSpokenTokens(activeTokens || [], candidateAlts || [], utteranceId ?? 0);
      this.cdr.detectChanges();
    };
  }

  private currentUtteranceId = -1;
  private consumedTokensInUtterance = 0;
  private failedTokenAttempts = 0;

  ngOnDestroy(): void {
    this.stopTimer();
    this.speechService.stop();
    this.speechService.stopNarrator();
  }

  /**
   * Motor de coincidencia fonética y ortográfica de ultra-alta precisión.
   * Procesa palabra por palabra en estricto orden secuencial rastreando los tokens
   * no consumidos por enunciado.
   * Previene saltos falsos, tolera sinalefas, palabras compuestas, números, tildes,
   * vacilaciones/muletillas ("eh", "um") y micro-stutters sin desfasar el progreso.
   */
  private processSpokenTokens(
    activeTokens: string[],
    candidateAlts: string[],
    utteranceId: number
  ): void {
    if (this.currentWordIndex >= this.totalWords || activeTokens.length === 0) return;

    if (utteranceId !== this.currentUtteranceId) {
      this.currentUtteranceId = utteranceId;
      this.consumedTokensInUtterance = 0;
      this.failedTokenAttempts = 0;
    }

    const unconsumed = activeTokens.slice(this.consumedTokensInUtterance);
    if (unconsumed.length === 0) return;

    let advanced = false;
    const initialIndex = this.currentWordIndex;
    const FILLERS = new Set(['eh', 'este', 'em', 'emm', 'ah', 'hum', 'um', 'uh', 'bueno', 'osea']);

    for (let i = 0; i < unconsumed.length; i++) {
      if (this.currentWordIndex >= this.totalWords) break;

      const token = unconsumed[i];
      const target = this.words[this.currentWordIndex];
      const normToken = normalizeSpanishWord(token);
      const normTarget = normalizeSpanishWord(target);

      // 1. Filtrar muletillas, ruidos breves o titubeos iniciales ("eh", "um", "ah", "hum")
      if (FILLERS.has(normToken) && normTarget !== 'este') {
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        continue;
      }

      // 2. Coincidencia directa fonética y ortográfica (máxima precisión con tildes, números y pronunciación guatemalteca)
      if (isPhoneticMatch(token, target)) {
        this.currentWordIndex++;
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        advanced = true;
        continue;
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
          this.consumedTokensInUtterance++;
          this.failedTokenAttempts = 0;
          advanced = true;
          continue;
        }
      }

      // 4. Palabra compuesta o tildada dividida en dos tokens por el micrófono (e.g. "tan", "bien" -> "también")
      if (i + 1 < unconsumed.length) {
        const combinedSpoken = token + unconsumed[i + 1];
        if (isPhoneticMatch(combinedSpoken, target)) {
          this.currentWordIndex++;
          this.consumedTokensInUtterance += 2;
          this.failedTokenAttempts = 0;
          i++;
          advanced = true;
          continue;
        }
      }

      // 5. Alternativas fonéticas devueltas por el motor de voz
      if (candidateAlts && candidateAlts.length > 0) {
        let altMatched = false;
        for (const alt of candidateAlts) {
          if (isPhoneticMatch(alt, target)) {
            this.currentWordIndex++;
            this.consumedTokensInUtterance++;
            this.failedTokenAttempts = 0;
            advanced = true;
            altMatched = true;
            break;
          }
        }
        if (altMatched) continue;
      }

      // 6. Si el alumno repitió la palabra anterior (relectura: "el... el"), consumimos el token sin avanzar erróneamente
      if (this.currentWordIndex > 0 && isPhoneticMatch(token, this.words[this.currentWordIndex - 1])) {
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        continue;
      }

      // 7. Lookahead en tokens hablados: si este token fue un ruido o chasquido pero el siguiente token coincide con la palabra actual
      if (i + 1 < unconsumed.length && isPhoneticMatch(unconsumed[i + 1], target)) {
        this.currentWordIndex++;
        this.consumedTokensInUtterance += 2;
        this.failedTokenAttempts = 0;
        i++;
        advanced = true;
        continue;
      }

      // 8. Lookahead en texto objetivo: si el alumno se saltó 1 palabra o preposición corta y dijo la siguiente
      if (this.currentWordIndex + 1 < this.totalWords && isPhoneticMatch(token, this.words[this.currentWordIndex + 1])) {
        this.currentWordIndex += 2;
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        advanced = true;
        continue;
      }

      // 9. Salto de 2 palabras cortas (e.g. omisión de "en la")
      if (
        this.currentWordIndex + 2 < this.totalWords &&
        (normTarget.length <= 3 || normalizeSpanishWord(this.words[this.currentWordIndex + 1]).length <= 3) &&
        isPhoneticMatch(token, this.words[this.currentWordIndex + 2])
      ) {
        this.currentWordIndex += 3;
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        advanced = true;
        continue;
      }

      // 10. Prevención de bloqueo por ruido persistente o token ininteligible:
      // Si el token tiene una coincidencia 2 tokens más adelante, descartamos este token como ruido
      if (i + 2 < unconsumed.length && isPhoneticMatch(unconsumed[i + 2], target)) {
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        continue;
      }

      // Si no coincide con ninguna regla, incrementar contador de intentos fallidos
      this.failedTokenAttempts++;
      if (this.failedTokenAttempts >= 4) {
        // Descartar el token bloqueante tras 4 ciclos sin coincidencia para reanudar el flujo libre
        this.consumedTokensInUtterance++;
        this.failedTokenAttempts = 0;
        continue;
      }

      // Detener este ciclo de procesamiento para esperar el próximo cuadro de audio
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
    this.currentUtteranceId = -1;
    this.consumedTokensInUtterance = 0;
    this.failedTokenAttempts = 0;
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
    this.currentUtteranceId = -1;
    this.consumedTokensInUtterance = 0;
    this.failedTokenAttempts = 0;
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
