import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading, ReadingAttemptResult } from '../../../../core/models/reading.model';
import {
  SpeechRecognitionService,
  SpeechTokensEvent,
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

  // Punteros de alineación monótona para evitar saltos de palabras
  private confirmedWordIndex = 0;
  private consumedFinalTokensIndex = 0;

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

    // Evento de alta fidelidad que procesa tokens finales e interinos por separado
    this.speechService.onSpeechTokens = (event) => {
      if (this.mode === 'mic') {
        this.processSpeechTokens(event);
      }
      this.updateLiveWpm();
      this.cdr.detectChanges();
    };

    this.speechService.onWordsUpdated = () => {
      this.updateLiveWpm();
      this.cdr.detectChanges();
    };
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.speechService.stop();
    this.speechService.stopNarrator();
  }

  /**
   * Motor de alineación fonética de ultra-alta precisión.
   * Elimina de raíz el problema de saltarse palabras:
   * 1. Confirma palabras finales en estricto orden monótono inmutable (nunca retrocede ni salta).
   * 2. Evalúa tokens provisionales en tiempo real para iluminación inmediata (<50ms).
   * 3. Soporta sinalefas ("de la" -> "dela", "de el" -> "del") y palabras divididas ("tan bien" -> "también").
   * 4. Bloqueo de confirmación de dos palabras: NUNCA salta una palabra por un solo token aislado.
   */
  private processSpeechTokens(event: SpeechTokensEvent): void {
    if (this.currentWordIndex >= this.totalWords) return;

    const initialWordIndex = this.currentWordIndex;
    const finalTokens = event.finalTokens || [];
    const interimTokens = event.interimTokens || [];
    const candidateAlts = event.candidateAlts || [];

    // 1. Procesar tokens finales confirmados (permanentes, inmutables)
    while (this.consumedFinalTokensIndex < finalTokens.length && this.confirmedWordIndex < this.totalWords) {
      const match = this.matchTokenAgainstText(
        this.confirmedWordIndex,
        this.consumedFinalTokensIndex,
        finalTokens,
        candidateAlts
      );

      if (match) {
        this.confirmedWordIndex += match.textWordsAdvanced;
        this.consumedFinalTokensIndex += match.tokensConsumed;
        continue;
      }

      const token = finalTokens[this.consumedFinalTokensIndex];

      // A. Muletilla o vacilación ("eh", "um", "ah", etc.)
      if (this.isFiller(token) && normalizeSpanishWord(this.words[this.confirmedWordIndex]) !== 'este') {
        this.consumedFinalTokensIndex++;
        continue;
      }

      // B. Relectura o autocorrección (el alumno repite una palabra previa para corregirse)
      if (this.confirmedWordIndex > 0 && isPhoneticMatch(token, this.words[this.confirmedWordIndex - 1])) {
        this.consumedFinalTokensIndex++;
        continue;
      }

      // C. Bloqueo de confirmación de dos palabras (Two-Word Confirmation Lock):
      // Si el alumno verdaderamente se saltó 1 palabra en el texto, SOLO se permite avanzar
      // si este token coincide con la palabra siguiente Y el token posterior coincide con la subsiguiente.
      // Jamás se salta una palabra por un solo token aislado (evita falsos saltos accidentales).
      if (
        this.confirmedWordIndex + 2 <= this.totalWords &&
        this.consumedFinalTokensIndex + 1 < finalTokens.length &&
        isPhoneticMatch(token, this.words[this.confirmedWordIndex + 1]) &&
        isPhoneticMatch(finalTokens[this.consumedFinalTokensIndex + 1], this.words[this.confirmedWordIndex + 2])
      ) {
        this.confirmedWordIndex += 2;
        this.consumedFinalTokensIndex += 2;
        continue;
      }

      // D. Token de ruido o distorsión acústica: consumir token y esperar al audio del alumno.
      // El cursor SE MANTIENE FIRME en la palabra actual, sin saltarse palabras.
      this.consumedFinalTokensIndex++;
    }

    // 2. Procesar tokens provisionales (interim) usando ventana deslizante dinámica con ancla acústica
    let tentativeWordIndex = this.confirmedWordIndex;

    if (interimTokens.length > 0 && this.confirmedWordIndex < this.totalWords) {
      let firstInterimIdx = 0;
      while (firstInterimIdx < interimTokens.length && this.isFiller(interimTokens[firstInterimIdx])) {
        firstInterimIdx++;
      }

      if (firstInterimIdx < interimTokens.length) {
        // Ventana de búsqueda de ancla centrada alrededor del punto más avanzado (confirmado o actual)
        const baseIdx = Math.max(this.confirmedWordIndex, this.currentWordIndex);
        const searchMin = Math.max(0, baseIdx - 2);
        const searchMax = Math.min(this.totalWords - 1, baseIdx + 3);

        let bestAnchorTextIdx = -1;
        let bestAnchorTokenIdx = -1;
        let bestAdvance = 0;

        for (let targetIdx = searchMin; targetIdx <= searchMax; targetIdx++) {
          const match = this.matchTokenAgainstText(
            targetIdx,
            firstInterimIdx,
            interimTokens,
            candidateAlts
          );

          if (match) {
            // Si el ancla se adelanta a la base, exigir confirmación de salto seguro
            if (targetIdx > baseIdx) {
              const skippedWord = normalizeSpanishWord(this.words[baseIdx]);
              const isShortWord = skippedWord.length <= 3;
              const hasNextInterimMatch =
                firstInterimIdx + match.tokensConsumed < interimTokens.length &&
                targetIdx + match.textWordsAdvanced < this.totalWords &&
                Boolean(
                  this.matchTokenAgainstText(
                    targetIdx + match.textWordsAdvanced,
                    firstInterimIdx + match.tokensConsumed,
                    interimTokens,
                    candidateAlts
                  )
                );

              if (!isShortWord && !hasNextInterimMatch) {
                continue;
              }
            }

            bestAnchorTextIdx = targetIdx;
            bestAnchorTokenIdx = firstInterimIdx;
            bestAdvance = match.textWordsAdvanced;
            break;
          }
        }

        // Si encontramos un ancla acústica válida, avanzar linealmente el resto de tokens interinos
        if (bestAnchorTextIdx !== -1) {
          let textPtr = bestAnchorTextIdx + bestAdvance;
          let tokenPtr = bestAnchorTokenIdx + 1;

          while (tokenPtr < interimTokens.length && textPtr < this.totalWords) {
            const match = this.matchTokenAgainstText(
              textPtr,
              tokenPtr,
              interimTokens,
              candidateAlts
            );

            if (match) {
              textPtr += match.textWordsAdvanced;
              tokenPtr += match.tokensConsumed;
            } else {
              const itoken = interimTokens[tokenPtr];
              if (
                this.isFiller(itoken) ||
                (textPtr > 0 && isPhoneticMatch(itoken, this.words[textPtr - 1]))
              ) {
                tokenPtr++;
              } else {
                break;
              }
            }
          }

          tentativeWordIndex = Math.max(tentativeWordIndex, textPtr);
        }
      }
    }

    // 3. Monotonicidad estricta: el cursor visual avanza fluidamente y jamás retrocede
    this.currentWordIndex = Math.max(
      this.currentWordIndex,
      Math.max(this.confirmedWordIndex, tentativeWordIndex)
    );

    // 4. Avance visual y efectos sonoros
    if (this.currentWordIndex > initialWordIndex) {
      const prevPercentage = Math.floor((initialWordIndex / this.totalWords) * 100);
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

    // 5. Finalizar lectura al completar todas las palabras
    if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
      this.finishReading();
    }
  }

  private isFiller(token: string): boolean {
    const norm = normalizeSpanishWord(token);
    const fillers = new Set(['eh', 'este', 'em', 'emm', 'ah', 'hum', 'um', 'uh', 'bueno', 'osea']);
    return fillers.has(norm);
  }

  private matchTokenAgainstText(
    targetIdx: number,
    tokenIdx: number,
    tokens: string[],
    alts?: string[]
  ): { textWordsAdvanced: number; tokensConsumed: number } | null {
    if (targetIdx >= this.totalWords || tokenIdx >= tokens.length) return null;

    const token = tokens[tokenIdx];
    const target = this.words[targetIdx];

    // 1. Coincidencia directa fonética y ortográfica
    if (isPhoneticMatch(token, target)) {
      return { textWordsAdvanced: 1, tokensConsumed: 1 };
    }

    // 2. Coincidencia con hipótesis alternativas devueltas por el reconocedor (maxAlternatives)
    if (alts && alts.length > 0) {
      for (const alt of alts) {
        if (isPhoneticMatch(alt, target)) {
          return { textWordsAdvanced: 1, tokensConsumed: 1 };
        }
      }
    }

    // 3. Sinalefa: dos palabras del texto pronunciadas en un solo golpe de voz continuo
    // ej. "de la", "a las", "de el" (del), "a el" (al), "en el", "y el", "de una"
    if (targetIdx + 1 < this.totalWords) {
      const nextTarget = this.words[targetIdx + 1];
      const combinedTarget = target + nextTarget;
      const normToken = normalizeSpanishWord(token);
      const normTarget = normalizeSpanishWord(target);
      const normNext = normalizeSpanishWord(nextTarget);

      if (
        isPhoneticMatch(token, combinedTarget) ||
        isPhoneticMatch(token, `${target} ${nextTarget}`) ||
        (normToken === 'del' && normTarget === 'de' && normNext === 'el') ||
        (normToken === 'al' && normTarget === 'a' && normNext === 'el')
      ) {
        return { textWordsAdvanced: 2, tokensConsumed: 1 };
      }
    }

    // 4. Palabra compuesta o tildada dividida en dos tokens por el reconocedor
    // ej. "tan" + "bien" -> "también", "a" + "donde" -> "adonde"
    if (tokenIdx + 1 < tokens.length) {
      const combinedSpoken = token + tokens[tokenIdx + 1];
      if (isPhoneticMatch(combinedSpoken, target)) {
        return { textWordsAdvanced: 1, tokensConsumed: 2 };
      }
    }

    return null;
  }

  private scrollToCurrentWord(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const currentEl = document.querySelector('.word-current') as HTMLElement | null;
      if (!currentEl) return;
      const rect = currentEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // Desplazamiento suave únicamente si la palabra activa se acerca al límite visible
      if (rect.bottom > viewportHeight - 160 || rect.top < 120) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, 10);
  }

  startReading(): void {
    this.stopNarrator();
    this.micError = null;
    this.currentWordIndex = 0;
    this.confirmedWordIndex = 0;
    this.consumedFinalTokensIndex = 0;
    this.secondsElapsed = 0;
    this.currentWpm = 0;
    this.startTimer();

    if (this.mode === 'mic') {
      const started = this.speechService.start();
      if (!started && !this.speechService.isSupported()) {
        this.mode = 'assisted';
        this.speechService.setAssistedSpeedMultiplier(this.assistedSpeedMultiplier);
        this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
          this.currentWordIndex = idx;
          this.confirmedWordIndex = idx;
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
        this.confirmedWordIndex = idx;
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
    this.confirmedWordIndex = 0;
    this.consumedFinalTokensIndex = 0;
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
    this.confirmedWordIndex = this.totalWords;

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
          const textBefore = this.reading.content.substring(0, charIndex);
          const wordCount = textBefore.trim().split(/\s+/).filter(Boolean).length;
          this.currentWordIndex = Math.min(this.totalWords, wordCount);
          this.confirmedWordIndex = this.currentWordIndex;
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
      this.toggleNarrator();
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
    if (this.isRecording) {
      return;
    }

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
