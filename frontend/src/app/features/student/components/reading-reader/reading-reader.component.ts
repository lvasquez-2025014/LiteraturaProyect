import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading, ReadingAttemptResult, Question } from '../../../../core/models/reading.model';
import { KINAL_READINGS } from '../../../../core/data/kinal-readings';
import {
  SpeechRecognitionService,
  SpeechTokensEvent,
  isPhoneticMatch,
  normalizeSpanishWord,
  toPhoneticKey,
  computePhoneticSimilarity,
  getWordEquivalents,
  isSpanishStopword,
} from '../../../../core/services/speech-recognition.service';
import confetti from 'canvas-confetti';

export interface ReadingWordToken {
  index: number;
  display: string;
  clean: string;
  phoneticKey: string;
  equivalents: string[];
  isPronounceable: boolean;
  isStopword: boolean;
}

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

  tokens: ReadingWordToken[] = [];
  words: string[] = [];
  totalWords = 0;

  isRecording = false;
  isPaused = false;
  isMicReady = false;
  isAudioActive = false;
  liveSpokenText = '';
  // El índice visual provisional permite retroalimentación rápida sin convertir
  // una hipótesis todavía cambiante del ASR en progreso académico definitivo.
  previewWordIndex = 0;
  currentWordIndex = 0;
  secondsElapsed = 0;
  currentWpm = 0;
  transcript = '';
  micError: string | null = null;
  mode: 'mic' | 'assisted' = 'mic';
  assistedSpeedMultiplier = 1.0;

  // Notificación visual de reanclaje
  reanchorToastMessage: string | null = null;
  private reanchorToastTimeout: any = null;

  // Palabras pre-normalizadas para comparación ultrarrápida
  normalizedWords: string[] = [];
  titleWords: string[] = [];
  normalizedTitleWords: string[] = [];

  // Punteros de alineación monótona para avance seguro y continuo
  private confirmedWordIndex = 0;
  private consumedFinalTokensCount = 0;
  private confirmedMatchedWords = 0;

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
  activeQuestions: Question[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  showExplanation = false;
  quizScore = 0;
  showVictory = false;
  finalResult: ReadingAttemptResult | null = null;

  private timerInterval: any = null;

  ngOnInit(): void {
    this.setupQuizQuestions();

    // Separación inteligente de palabras preservando signos tipográficos sin crear tokens vacíos
    const rawSegments = this.reading.content.trim().split(/\s+/).filter(Boolean);
    const tokens: ReadingWordToken[] = [];

    for (let i = 0; i < rawSegments.length; i++) {
      const raw = rawSegments[i];
      const clean = normalizeSpanishWord(raw);

      if (!clean) {
        // Signos tipográficos aislados (ej. rayas de diálogo "—", comillas, puntos suspensivos)
        if (tokens.length > 0) {
          tokens[tokens.length - 1].display += ' ' + raw;
        } else if (i + 1 < rawSegments.length) {
          rawSegments[i + 1] = raw + ' ' + rawSegments[i + 1];
        }
        continue;
      }

      tokens.push({
        index: tokens.length,
        display: raw,
        clean,
        phoneticKey: toPhoneticKey(clean),
        equivalents: getWordEquivalents(clean),
        isPronounceable: true,
        isStopword: isSpanishStopword(clean),
      });
    }

    this.tokens = tokens;
    this.words = tokens.map((t) => t.display);
    this.totalWords = tokens.length;
    this.normalizedWords = tokens.map((t) => t.clean);

    this.titleWords = (this.reading.title || '').trim().split(/\s+/).filter(Boolean);
    this.normalizedTitleWords = this.titleWords.map((w) => normalizeSpanishWord(w)).filter(Boolean);

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
    if (this.reanchorToastTimeout) {
      clearTimeout(this.reanchorToastTimeout);
    }
    this.speechService.stop();
    this.speechService.stopNarrator();
  }

  /**
   * Reanclaje interactivo al hacer clic o tap en cualquier palabra del texto.
   * Permite al estudiante retomar la lectura al instante sin atascarse.
   */
  public reanchorToWord(index: number): void {
    if (index < 0 || index >= this.totalWords) return;
    this.currentWordIndex = index;
    this.previewWordIndex = index;
    this.confirmedWordIndex = index;
    this.consumedFinalTokensCount = 0;
    this.liveSpokenText = '';
    this.speechService.resetTranscriptForReanchor();

    const wordDisplay = this.words[index] || '';
    this.reanchorToastMessage = `Lectura sincronizada en la palabra ${index + 1}: "${wordDisplay}"`;
    if (this.reanchorToastTimeout) {
      clearTimeout(this.reanchorToastTimeout);
    }
    this.reanchorToastTimeout = setTimeout(() => {
      this.reanchorToastMessage = null;
      this.cdr.detectChanges();
    }, 2800);

    this.scrollToCurrentWord();
    if (this.soundEffects) {
      this.speechService.playWordChime();
    }
    this.cdr.detectChanges();
  }

  /**
   * Motor de Alineación Dinámica Bandeada con Evidencia Acotada (Smith-Waterman / Needleman-Wunsch).
   * Tolera omisiones y variaciones fonéticas, impidiendo matemáticamente saltos arbitrarios de líneas.
   */
  public alignBandedDP(
    baseIndex: number,
    spokenTokens: string[],
    candidateAlts?: string[]
  ): { targetIndex: number; matchedCount: number } {
    if (!spokenTokens || spokenTokens.length === 0 || baseIndex >= this.totalWords) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    // 1. Filtrar muletillas ('eh', 'este', 'em', 'um', etc.)
    const cleanTokens = spokenTokens.filter((t) => !this.isFiller(t));
    if (cleanTokens.length === 0) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    // 2. Sincronización y descarte de prefijo histórico:
    let startTok = 0;
    if (baseIndex === 0 && this.normalizedTitleWords.length > 0) {
      // Si el estudiante lee el título al inicio, sincronizar tras el título
      const firstTarget = this.normalizedWords[0];
      const secondTarget = this.normalizedWords[1] || '';
      for (let t = 0; t < cleanTokens.length; t++) {
        if (
          isPhoneticMatch(cleanTokens[t], firstTarget) ||
          (secondTarget && isPhoneticMatch(cleanTokens[t], secondTarget))
        ) {
          startTok = t;
          break;
        }
      }
    } else if (baseIndex > 0 && cleanTokens.length > 2) {
      // ANCLAJE DINÁMICO EN EL TEXTO HABLADO ACUMULADO:
      // Chrome suele acumular las palabras de la sesión o frase en cleanTokens.
      // Cuando baseIndex > 0, las palabras del inicio de cleanTokens ya fueron leídas.
      // Si no descartamos ese prefijo histórico, la matriz DP acumula penalizaciones por omisión
      // de tokens viejos y bloquea el avance cuando el texto es largo.
      const currentTarget = this.normalizedWords[baseIndex] || '';
      const prevTarget = baseIndex > 0 ? this.normalizedWords[baseIndex - 1] : '';
      const nextTarget = baseIndex + 1 < this.totalWords ? this.normalizedWords[baseIndex + 1] : '';

      let bestAnchor = -1;
      let bestAnchorScore = 0;

      // Buscar de atrás hacia adelante en cleanTokens para anclar en la elocución más reciente
      for (let t = cleanTokens.length - 1; t >= 0; t--) {
        const tok = cleanTokens[t];
        let score = 0;
        if (currentTarget && isPhoneticMatch(tok, currentTarget)) {
          score = 3.0;
        } else if (nextTarget && isPhoneticMatch(tok, nextTarget)) {
          score = 2.5;
        } else if (prevTarget && isPhoneticMatch(tok, prevTarget)) {
          score = 2.0;
        }

        if (score > bestAnchorScore) {
          bestAnchorScore = score;
          bestAnchor = t;
          if (score === 3.0) break;
        }
      }

      if (bestAnchor >= 0) {
        startTok = Math.max(0, bestAnchor - 1);
      } else if (cleanTokens.length > 10) {
        startTok = Math.max(0, cleanTokens.length - 8);
      }
    }
    const activeSpoken = cleanTokens.slice(startTok);
    if (activeSpoken.length === 0) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    // 3. Ventana adaptativa proporcional a la longitud de palabras habladas:
    // Evita físicamente inspeccionar líneas distantes ante ruidos o palabras aisladas.
    const maxForward = Math.min(30, Math.max(5, activeSpoken.length * 2 + 6));
    const windowStart = Math.max(0, baseIndex - 1);
    const windowEnd = Math.min(this.totalWords, baseIndex + maxForward);
    const textSlice = this.tokens.slice(windowStart, windowEnd);
    if (textSlice.length === 0) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }

    const M = activeSpoken.length;
    const N = textSlice.length;
    const dp: number[][] = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(0));
    const matchCount: number[][] = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(0));
    const contentMatchCount: number[][] = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(0));

    for (let i = 1; i <= M; i++) {
      const spokenTok = activeSpoken[i - 1];
      for (let j = 1; j <= N; j++) {
        const word = textSlice[j - 1];
        const globalWordIdx = windowStart + j - 1;

        let sim = computePhoneticSimilarity(spokenTok, word.clean);

        // Hipótesis alternativas del reconocedor
        if (sim < 0.75 && candidateAlts && candidateAlts.length > 0) {
          for (const alt of candidateAlts) {
            const altSim = computePhoneticSimilarity(alt, word.clean);
            if (altSim > sim) sim = altSim;
          }
        }

        // Combinación de 2 tokens hablados continuos (ej. "tan" + "bien" -> "también", o "veinti" + "uno")
        if (sim < 0.75 && i >= 2) {
          const comboSpoken = activeSpoken[i - 2] + activeSpoken[i - 1];
          const comboSim = computePhoneticSimilarity(comboSpoken, word.clean);
          if (comboSim > sim) sim = comboSim;
        }

        let matchReward = -1.0;
        let isMatch = false;
        if (sim >= 0.85) {
          matchReward = 3.5 * sim;
          isMatch = true;
        } else if (sim >= 0.72) {
          matchReward = 2.2 * sim;
          isMatch = true;
        }

        // Penalización de anclaje inicial aplicada al primer token para desincentivar saltos lejanos
        let anchorPenalty = 0;
        if (i === 1) {
          const distFromBase = Math.max(0, globalWordIdx - baseIndex);
          anchorPenalty = distFromBase * 0.40;
        }

        const scoreDiag = dp[i - 1][j - 1] + matchReward - anchorPenalty;
        const scoreSkipText = dp[i][j - 1] - 1.2; // Penalización por omitir palabra del texto
        const scoreSkipSpoken = dp[i - 1][j] - 0.5; // Penalización por palabra hablada sobrante o ruido

        const bestScore = Math.max(0, scoreDiag, scoreSkipText, scoreSkipSpoken);
        dp[i][j] = bestScore;

        if (bestScore === scoreDiag && isMatch) {
          matchCount[i][j] = matchCount[i - 1][j - 1] + 1;
          contentMatchCount[i][j] = contentMatchCount[i - 1][j - 1] + (word.isStopword ? 0 : 1);
        } else if (bestScore === scoreSkipText) {
          matchCount[i][j] = matchCount[i][j - 1];
          contentMatchCount[i][j] = contentMatchCount[i][j - 1];
        } else if (bestScore === scoreSkipSpoken) {
          matchCount[i][j] = matchCount[i - 1][j];
          contentMatchCount[i][j] = contentMatchCount[i - 1][j];
        }
      }
    }

    let bestScore = 0;
    let bestJ = 0;
    let bestMatches = 0;
    let bestContentMatches = 0;

    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= N; j++) {
        if (
          dp[i][j] > bestScore ||
          (dp[i][j] === bestScore && matchCount[i][j] > bestMatches)
        ) {
          bestScore = dp[i][j];
          bestJ = j;
          bestMatches = matchCount[i][j];
          bestContentMatches = contentMatchCount[i][j];
        }
      }
    }

    if (bestScore >= 1.6 && bestJ > 0 && bestMatches >= 1) {
      const candidateTarget = windowStart + bestJ;
      const jumpDistance = candidateTarget - baseIndex;

      // Validación Matemática del Salto en función de la Evidencia Acumulada:
      // Imposibilita que 1 o 2 palabras salten 3 líneas (> 15 palabras).
      let allowedSkip = 0;
      if (bestMatches === 1) {
        allowedSkip = 1; // Salto máximo de 2 palabras (progreso normal o salto de artículo)
      } else if (bestMatches === 2) {
        allowedSkip = 2; // Salto máximo de 4 palabras
      } else if (bestMatches === 3) {
        allowedSkip = 2; // Salto máximo de 5 palabras
      } else if (bestMatches <= 5) {
        allowedSkip = 3; // Salto máximo de 8 palabras
      } else {
        // 6+ palabras coincidentes: permite saltos mayores si se articuló una oración completa
        if (bestScore >= 14 && bestContentMatches >= 4) {
          allowedSkip = 16;
        } else {
          allowedSkip = 5;
        }
      }

      const maxAllowedJump = bestMatches + allowedSkip;

      if (jumpDistance > 0 && jumpDistance <= maxAllowedJump) {
        // Protección contra stopwords: palabras vacías no pueden saltar palabras con contenido
        if (jumpDistance >= 3 && bestContentMatches < 1 && bestMatches < 3) {
          return { targetIndex: baseIndex, matchedCount: 0 };
        }

        return {
          targetIndex: Math.min(this.totalWords, candidateTarget),
          matchedCount: bestMatches,
        };
      }
    }

    return { targetIndex: baseIndex, matchedCount: 0 };
  }

  /**
   * Alias de compatibilidad hacia atrás para el motor de alineación
   */
  public alignTokenSequence(
    baseIndex: number,
    tokens: string[],
    candidateAlts?: string[]
  ): { targetIndex: number; matchedCount: number } {
    return this.alignBandedDP(baseIndex, tokens, candidateAlts);
  }

  /**
   * Procesa eventos de tokens con alineación monótona en dos niveles (interim reactivo vs final autoritativo).
   */
  private processSpeechTokens(event: SpeechTokensEvent): void {
    if (this.currentWordIndex >= this.totalWords) return;

    const initialWordIndex = this.currentWordIndex;
    const finalTokens = event.finalTokens || [];
    const interimTokens = event.interimTokens || [];
    // 1. Nivel Autoritativo: Procesar tokens finales confirmados
    if (finalTokens.length > this.consumedFinalTokensCount) {
      const newFinalTokens = finalTokens.slice(this.consumedFinalTokensCount);
      const alignFinal = this.alignBandedDP(
        this.confirmedWordIndex,
        newFinalTokens
      );
      if (alignFinal.matchedCount > 0 && alignFinal.targetIndex > this.confirmedWordIndex) {
        this.confirmedWordIndex = alignFinal.targetIndex;
        this.currentWordIndex = Math.max(this.currentWordIndex, alignFinal.targetIndex);
        this.confirmedMatchedWords = Math.max(this.confirmedMatchedWords, this.currentWordIndex);
        this.consumedFinalTokensCount = finalTokens.length;
      } else if (finalTokens.length - this.consumedFinalTokensCount > 4) {
        // Descartar tokens no emparejados si se acumula ruido para no bloquear el flujo
        this.consumedFinalTokensCount = finalTokens.length;
      }
    }

    // 2. Nivel Reactivo en Tiempo Real:
    // El estudiante lee en voz alta continuamente. Durante la elocución, Chrome emite
    // resultados interinos sin pausas finales. Avanzamos el cursor y las palabras leídas
    // en tiempo real para evitar que la lectura se congele.
    if (interimTokens.length > 0) {
      this.liveSpokenText = interimTokens.slice(-14).join(' ');
      const alignInterim = this.alignBandedDP(
        this.currentWordIndex,
        interimTokens
      );
      if (alignInterim.matchedCount > 0 && alignInterim.targetIndex > this.currentWordIndex) {
        this.currentWordIndex = alignInterim.targetIndex;
        this.confirmedWordIndex = Math.max(this.confirmedWordIndex, alignInterim.targetIndex);
        this.confirmedMatchedWords = Math.max(this.confirmedMatchedWords, this.currentWordIndex);
        this.updateLiveWpm();
      }
    } else {
      if (finalTokens.length > 0) {
        this.liveSpokenText = finalTokens.slice(-8).join(' ');
      } else {
        this.liveSpokenText = '';
      }
    }

    this.previewWordIndex = this.currentWordIndex;

    // 4. Avance visual, auto-scroll y efectos sonoros
    if (this.currentWordIndex > initialWordIndex) {
      const prevPercentage = Math.floor((initialWordIndex / this.totalWords) * 100);
      const newPercentage = Math.floor((this.currentWordIndex / this.totalWords) * 100);

      this.scrollToCurrentWord();

      // No emitir tonos mientras el micrófono está escuchando: en altavoces
      // pueden introducir eco y ruido que el reconocedor interprete como voz.
      if (this.soundEffects && this.mode !== 'mic') {
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

    // 5. Finalizar lectura al alcanzar el final del texto
    if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
      this.finishReading();
    }
  }

  private isFiller(token: string): boolean {
    const norm = normalizeSpanishWord(token);
    // "este" y "bueno" pueden formar parte de la lectura; solo se omiten
    // interjecciones que no pueden ser palabras objetivo en este contexto.
    const fillers = new Set(['eh', 'em', 'emm', 'ah', 'hum', 'um', 'uh', 'osea']);
    return fillers.has(norm);
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
    this.previewWordIndex = 0;
    this.confirmedWordIndex = 0;
    this.consumedFinalTokensCount = 0;
    this.confirmedMatchedWords = 0;
    this.liveSpokenText = '';
    this.secondsElapsed = 0;
    this.currentWpm = 0;
    this.startTimer();

    if (this.mode === 'mic') {
      const started = this.speechService.start();
      if (!started) {
        if (!this.speechService.isSupported()) {
          this.mode = 'assisted';
          this.speechService.setAssistedSpeedMultiplier(this.assistedSpeedMultiplier);
          this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
            this.currentWordIndex = idx;
            this.previewWordIndex = idx;
            this.confirmedWordIndex = idx;
            this.confirmedMatchedWords = idx;
            this.updateLiveWpm();
            if (this.currentWordIndex >= this.totalWords) {
              this.finishReading();
            }
            this.cdr.detectChanges();
          });
        } else {
          this.stopTimer();
          this.isRecording = false;
          this.micError = 'No fue posible iniciar el micrófono. Revisa el permiso y vuelve a intentarlo.';
        }
      }
    } else {
      this.speechService.setAssistedSpeedMultiplier(this.assistedSpeedMultiplier);
      this.speechService.startAssistedSimulation(this.words, this.reading.targetWpm, (idx) => {
        this.currentWordIndex = idx;
        this.previewWordIndex = idx;
        this.confirmedWordIndex = idx;
        this.confirmedMatchedWords = idx;
        this.updateLiveWpm();
        if (this.currentWordIndex >= this.totalWords) {
          this.finishReading();
        }
        this.cdr.detectChanges();
      });
    }
  }

  updateLiveWpm(): void {
    if (this.secondsElapsed <= 0 || this.confirmedMatchedWords <= 0) {
      this.currentWpm = 0;
      return;
    }
    const raw = Math.round((this.confirmedMatchedWords / this.secondsElapsed) * 60);
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
    this.previewWordIndex = 0;
    this.confirmedWordIndex = 0;
    this.consumedFinalTokensCount = 0;
    this.confirmedMatchedWords = 0;
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
    // Finalizar manualmente no debe fingir que las palabras pendientes se leyeron.
    // El resultado conserva únicamente el avance confirmado por el micrófono.
    this.previewWordIndex = this.currentWordIndex;

    this.setupQuizQuestions();

    // Abrir el cuestionario si hay preguntas activas, o calcular victoria directamente
    if (this.activeQuestions.length > 0) {
      this.showQuiz = true;
      this.currentQuestionIndex = 0;
    } else {
      this.calculateFinalResults();
    }
    this.isRecording = false;
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
    return Math.abs(index - this.previewWordIndex) <= 6;
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
          this.previewWordIndex = this.currentWordIndex;
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
      this.reanchorToWord(index);
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

  /**
   * Selecciona 3 preguntas aleatorias del banco de preguntas (Math.random)
   * y baraja las opciones A, B, C, D para evitar que los alumnos se pasen copia.
   */
  public setupQuizQuestions(): void {
    let pool: Question[] = [];

    if (this.reading && this.reading.questions && this.reading.questions.length > 0) {
      pool = [...this.reading.questions];
    }

    // Si la lectura en memoria o DB tiene menos preguntas, completar con el banco de KINAL_READINGS
    const kinalFallback = KINAL_READINGS.find(
      (k) => k.id === this.reading?.id || k.level === this.reading?.level || k.title === this.reading?.title
    );
    if (kinalFallback && kinalFallback.questions && kinalFallback.questions.length > pool.length) {
      pool = [...kinalFallback.questions];
    }

    if (pool.length === 0) {
      this.activeQuestions = [];
      return;
    }

    // Barajado Fisher-Yates de las preguntas usando Math.random()
    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    // Tomar 3 preguntas aleatorias del banco
    const sampleSize = Math.min(shuffledPool.length, 3);
    const selected = shuffledPool.slice(0, sampleSize);

    // Barajar también las opciones A, B, C, D de cada pregunta y recalcular correctIndex
    this.activeQuestions = selected.map((q) => {
      const originalCorrectText = q.options[q.correctIndex];
      const shuffledOptions = [...q.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      };
    });

    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.showExplanation = false;
  }

  selectQuizOption(optIdx: number): void {
    if (this.showExplanation) return;
    this.selectedAnswers[this.currentQuestionIndex] = optIdx;
    this.showExplanation = true;
  }

  nextQuestion(): void {
    this.showExplanation = false;
    if (this.currentQuestionIndex < this.activeQuestions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.calculateFinalResults();
    }
  }

  calculateFinalResults(): void {
    this.showQuiz = false;

    let correctCount = 0;
    this.activeQuestions.forEach((q, idx) => {
      if (this.selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    this.quizScore = this.activeQuestions.length > 0
      ? Math.round((correctCount / this.activeQuestions.length) * 100)
      : 100;

    const calculatedWpm =
      this.secondsElapsed > 0 && this.confirmedMatchedWords > 0
        ? Math.round((this.confirmedMatchedWords / this.secondsElapsed) * 60)
        : this.currentWpm;
    const oralAccuracy = this.totalWords > 0
      ? Math.round((this.confirmedMatchedWords / this.totalWords) * 100)
      : 0;

    this.finalResult = {
      readingId: this.reading.id,
      readingTitle: this.reading.title,
      studentId: this.studentId,
      wpm: calculatedWpm,
      accuracy: oralAccuracy,
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
