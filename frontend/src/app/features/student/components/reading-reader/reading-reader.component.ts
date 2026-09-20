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
  isMicReady = false;
  isAudioActive = false;
  liveSpokenText = '';
  currentWordIndex = 0;
  secondsElapsed = 0;
  currentWpm = 0;
  transcript = '';
  micError: string | null = null;
  mode: 'mic' | 'assisted' = 'mic';
  assistedSpeedMultiplier = 1.0;

  // Palabras pre-normalizadas para comparación ultrarrápida
  normalizedWords: string[] = [];
  titleWords: string[] = [];
  normalizedTitleWords: string[] = [];

  // Punteros de alineación monótona para avance seguro y continuo
  private confirmedWordIndex = 0;
  private consumedFinalTokensCount = 0;

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
    // Sanitizar y separar palabras respetando signos pero aislando rayas de diálogo o espacios múltiples
    const cleanContent = this.reading.content
      .replace(/—/g, ' — ')
      .replace(/\s+/g, ' ')
      .trim();
    this.words = cleanContent.split(' ').filter(Boolean);
    this.totalWords = this.words.length;
    this.normalizedWords = this.words.map((w) => normalizeSpanishWord(w));

    this.titleWords = (this.reading.title || '').trim().split(/\s+/).filter(Boolean);
    this.normalizedTitleWords = this.titleWords.map((w) => normalizeSpanishWord(w));

    this.selectedAnswers = new Array(this.reading.questions.length).fill(-1);

    this.speechService.onStateChange = (state) => {
      this.isRecording = state.isListening && !state.isPaused;
      this.isPaused = state.isPaused;
      this.isMicReady = state.isMicReady;
      this.isAudioActive = state.isAudioActive;
      this.transcript = state.transcript;
      if (state.interimTranscript) {
        this.liveSpokenText = state.interimTranscript;
      }
      if (state.error) {
        this.micError = state.error;
      }
      this.cdr.detectChanges();
    };

    // Evento de alta fidelidad que procesa tokens finales e interinos con ventana elástica
    this.speechService.onSpeechTokens = (event) => {
      if (this.mode === 'mic') {
        if (event.isAudioActive !== undefined) {
          this.isAudioActive = event.isAudioActive;
        }
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
   * Motor de alineación elástica multipalabra por ventana deslizante.
   * Resuelve de raíz los 3 desafíos clave de la lectura en voz alta:
   * 1. Arranque inmediato: tolera si el micrófono recortó la primera palabra.
   * 2. Tolerancia a lectura de título previa sin desorientar el cursor.
   * 3. Alineación continua sin congelamiento en frases largas ni desincronización por palabras saltadas.
   */
  private alignTokenSequence(
    baseIndex: number,
    tokens: string[],
    candidateAlts?: string[]
  ): { targetIndex: number; matchedCount: number } {
    if (!tokens || tokens.length === 0 || baseIndex >= this.totalWords) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    // 1. Filtrar muletillas iniciales del fragmento ("eh", "um", etc.)
    let startTokIdx = 0;
    while (startTokIdx < tokens.length && this.isFiller(tokens[startTokIdx])) {
      startTokIdx++;
    }
    if (startTokIdx >= tokens.length) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    // 2. Si estamos al principio (baseIndex === 0) y el estudiante leyó el título antes de la lectura,
    // buscar si el texto de la lectura comienza tras las palabras del título
    if (baseIndex === 0 && this.normalizedTitleWords.length > 0) {
      const firstTargetWord = this.normalizedWords[0];
      const secondTargetWord = this.normalizedWords[1] || '';
      for (let t = startTokIdx; t < tokens.length; t++) {
        if (
          isPhoneticMatch(tokens[t], firstTargetWord) ||
          (secondTargetWord && isPhoneticMatch(tokens[t], secondTargetWord))
        ) {
          startTokIdx = t;
          break;
        }
      }
    }

    // 3. Ventana de búsqueda de ancla amplia:
    // Permite mirar 2 palabras atrás (re-lecturas) y hasta 30 palabras adelante (saltos de frase o buffer largo de voz)
    const minText = Math.max(0, baseIndex - 2);
    const maxText = Math.min(this.totalWords - 1, baseIndex + 30);

    let bestAnchor = {
      textIdx: -1,
      tokIdx: -1,
      matchedCount: 0,
      endTextIdx: baseIndex,
    };

    // Escanear los primeros tokens para encontrar todos los anclas candidatos y elegir el óptimo
    const maxTokenAnchorScan = Math.min(tokens.length, startTokIdx + 5);

    for (let t = startTokIdx; t < maxTokenAnchorScan; t++) {
      const tok = tokens[t];
      if (this.isFiller(tok)) continue;

      for (let w = minText; w <= maxText; w++) {
        const directMatch = this.matchTokenAgainstText(w, t, tokens, candidateAlts);
        if (!directMatch) continue;

        // Simular avance secuencial desde este ancla candidato para calcular su longitud de coincidencia
        let textPtr = w + directMatch.textWordsAdvanced;
        let tokPtr = t + directMatch.tokensConsumed;
        let candidateMatched = directMatch.textWordsAdvanced;

        while (tokPtr < tokens.length && textPtr < this.totalWords) {
          const match = this.matchTokenAgainstText(textPtr, tokPtr, tokens, candidateAlts);
          if (match) {
            textPtr += match.textWordsAdvanced;
            tokPtr += match.tokensConsumed;
            candidateMatched += match.textWordsAdvanced;
            continue;
          }

          const currentTok = tokens[tokPtr];

          // Muletilla o repetición de la palabra recién leída
          if (
            this.isFiller(currentTok) ||
            (textPtr > 0 && isPhoneticMatch(currentTok, this.words[textPtr - 1]))
          ) {
            tokPtr++;
            continue;
          }

          // Omisión de palabra corta en el texto (ej. "de", "la", "el", "a", "en")
          if (
            textPtr + 1 < this.totalWords &&
            this.normalizedWords[textPtr].length <= 3 &&
            isPhoneticMatch(currentTok, this.words[textPtr + 1])
          ) {
            textPtr += 2;
            tokPtr++;
            candidateMatched += 1;
            continue;
          }

          // Sustitución fonética de una sola palabra
          if (
            textPtr + 1 < this.totalWords &&
            tokPtr + 1 < tokens.length &&
            isPhoneticMatch(tokens[tokPtr + 1], this.words[textPtr + 1])
          ) {
            textPtr += 2;
            tokPtr += 2;
            candidateMatched += 1;
            continue;
          }

          // Discrepancia no recuperable en esta cadena
          break;
        }

        // Criterio de validación de ancla según distancia de salto:
        const jumpDistance = w - baseIndex;
        let isValid = false;

        if (jumpDistance <= 1) {
          // En posición actual o paso inmediato (+1)
          isValid = candidateMatched >= 1;
        } else if (jumpDistance <= 6) {
          // Salto moderado (2 a 6 palabras)
          isValid = candidateMatched >= 2 || this.normalizedWords[w].length >= 5;
        } else {
          // Salto amplio (> 6 palabras): exigir al menos 2 palabras en secuencia o 3+ coincidencias
          isValid = candidateMatched >= 2;
        }

        if (isValid) {
          // Seleccionar el ancla que proporcione la mayor cantidad de palabras coincidentes
          // En caso de empate, preferir el más cercano a baseIndex
          if (
            candidateMatched > bestAnchor.matchedCount ||
            (candidateMatched === bestAnchor.matchedCount &&
              Math.abs(w - baseIndex) < Math.abs(bestAnchor.textIdx - baseIndex))
          ) {
            bestAnchor = {
              textIdx: w,
              tokIdx: t,
              matchedCount: candidateMatched,
              endTextIdx: textPtr,
            };
          }
        }
      }
    }

    if (bestAnchor.matchedCount > 0 && bestAnchor.endTextIdx > baseIndex) {
      return {
        targetIndex: Math.min(this.totalWords, bestAnchor.endTextIdx),
        matchedCount: bestAnchor.matchedCount,
      };
    }

    return { targetIndex: baseIndex, matchedCount: 0 };
  }

  /**
   * Procesa eventos de tokens con alineación monótona en tiempo real.
   */
  private processSpeechTokens(event: SpeechTokensEvent): void {
    if (this.currentWordIndex >= this.totalWords) return;

    const initialWordIndex = this.currentWordIndex;
    const finalTokens = event.finalTokens || [];
    const interimTokens = event.interimTokens || [];
    const candidateAlts = event.candidateAlts || [];

    // 1. Procesar nuevos tokens finales confirmados
    if (finalTokens.length > this.consumedFinalTokensCount) {
      const newFinalTokens = finalTokens.slice(this.consumedFinalTokensCount);
      const alignFinal = this.alignTokenSequence(
        this.confirmedWordIndex,
        newFinalTokens,
        candidateAlts
      );
      if (alignFinal.matchedCount > 0) {
        this.confirmedWordIndex = Math.max(this.confirmedWordIndex, alignFinal.targetIndex);
      }
      this.consumedFinalTokensCount = finalTokens.length;
    }

    // 2. Procesar tokens provisionales (interim) en tiempo real (<50ms)
    let tentativeWordIndex = this.confirmedWordIndex;
    if (interimTokens.length > 0) {
      this.liveSpokenText = interimTokens.join(' ');
      const baseSearch = Math.max(
        this.confirmedWordIndex,
        Math.min(this.currentWordIndex, this.confirmedWordIndex + 2)
      );
      const alignInterim = this.alignTokenSequence(
        baseSearch,
        interimTokens,
        candidateAlts
      );
      if (alignInterim.matchedCount > 0) {
        tentativeWordIndex = Math.max(tentativeWordIndex, alignInterim.targetIndex);
      }
    }

    // 3. Monotonicidad estricta: avanzar sin saltos abruptos ni retrocesos
    this.currentWordIndex = Math.min(
      this.totalWords,
      Math.max(this.currentWordIndex, Math.max(this.confirmedWordIndex, tentativeWordIndex))
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
    const normToken = normalizeSpanishWord(token);
    const normTarget = this.normalizedWords[targetIdx];

    // 1. Coincidencia directa fonética y ortográfica
    if (isPhoneticMatch(token, target)) {
      return { textWordsAdvanced: 1, tokensConsumed: 1 };
    }

    // 1b. Coincidencia de prefijo para palabras en curso (ej. "bosq" <-> "bosque")
    if (
      normToken.length >= 4 &&
      normTarget.length >= 4 &&
      (normTarget.startsWith(normToken) || normToken.startsWith(normTarget))
    ) {
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
      const normNext = this.normalizedWords[targetIdx + 1];

      if (
        isPhoneticMatch(token, combinedTarget) ||
        isPhoneticMatch(token, `${target} ${nextTarget}`) ||
        (normToken === 'del' && normTarget === 'de' && normNext === 'el') ||
        (normToken === 'al' && normTarget === 'a' && normNext === 'el') ||
        (normToken === 'dela' && normTarget === 'de' && normNext === 'la') ||
        (normToken === 'alas' && normTarget === 'a' && normNext === 'las')
      ) {
        return { textWordsAdvanced: 2, tokensConsumed: 1 };
      }
    }

    // 4. Palabra compuesta o dividida en dos tokens por el reconocedor
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
    this.consumedFinalTokensCount = 0;
    this.liveSpokenText = '';
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
    this.consumedFinalTokensCount = 0;
    this.liveSpokenText = '';
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
      readingTitle: this.reading.title,
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
