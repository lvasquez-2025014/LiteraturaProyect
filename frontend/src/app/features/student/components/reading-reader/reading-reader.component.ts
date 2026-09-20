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
   * Distancia de Levenshtein rápida con vector 1D (proveniente de preview.html)
   */
  public fastLevenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (!a) return b.length;
    if (!b) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /**
   * Similitud ortográfica relativa en rango [0, 1]
   */
  public similarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;
    return 1 - this.fastLevenshtein(a, b) / Math.max(a.length, b.length);
  }

  /**
   * Puntuación de coincidencia de preview.html:
   * - Coincidencia exacta o equivalencia (números, variantes mayas, contracciones)
   * - Reconocimiento de prefijos provisionales en tiempo real para palabras de 4+ letras
   * - Similitud fonética y ortográfica estricta
   */
  public matchScore(
    spoken: string,
    expectedToken: ReadingWordToken,
    interim: boolean
  ): number {
    if (!spoken || !expectedToken) return 0;
    const expected = expectedToken.clean;
    if (spoken === expected) return 1;

    // Equivalencias directas (ej. "2" <-> "dos", "1" <-> "un", variantes mayas y contracciones)
    if (expectedToken.equivalents && expectedToken.equivalents.includes(spoken)) {
      return 1;
    }

    // Fonética idéntica latinoamericana (seseo c/s/z, betacismo b/v, yeísmo ll/y)
    if (expectedToken.phoneticKey && toPhoneticKey(spoken) === expectedToken.phoneticKey) {
      return 0.96;
    }

    // Prefijo en tiempo real (preview.html): reconocer palabras de 4+ letras antes de que Chrome termine de formarlas
    if (interim && expected.length >= 4 && spoken.length >= 2) {
      if (expected.startsWith(spoken)) {
        return Math.min(0.995, 0.86 + (spoken.length / expected.length) * 0.12);
      }
      if (spoken.startsWith(expected)) {
        return 0.985;
      }
    }

    return this.similarity(spoken, expected);
  }

  /**
   * Umbrales dinámicos de preview.html que previenen saltos involuntarios:
   * - Palabras cortas (<= 2 letras): 0.985 (interim) y 0.96 (final)
   * - Palabras medianas (3 letras): 0.94 (interim) y 0.92 (final)
   * - Palabras de 4+ letras: 0.80 (interim) y 0.82 (final)
   */
  public threshold(word: string, interim: boolean): number {
    if (interim) {
      if (word.length <= 2) return 0.985;
      if (word.length === 3) return 0.94;
      return 0.80;
    }
    if (word.length <= 2) return 0.96;
    if (word.length === 3) return 0.92;
    return 0.82;
  }

  /**
   * Motor de cálculo de índice de preview.html:
   * Encuentra la palabra actual dentro de la ventana de reconocimiento y avanza de forma estrictamente monótona.
   */
  public calculateIndex(spokenWords: string[], interim: boolean): number {
    if (!spokenWords.length || this.currentWordIndex >= this.totalWords) {
      return this.currentWordIndex;
    }

    const center = this.currentWordIndex;
    const start = Math.max(0, Math.min(center - 5, spokenWords.length - 12));
    const end = spokenWords.length - 1;

    let bestPointer = this.currentWordIndex;
    let bestMatches = 0;

    const anchorCandidates: { spokenIdx: number; textIdx: number; initialScore: number }[] = [];

    // Prioridad 1: palabra actual
    const currentTarget = this.tokens[this.currentWordIndex];
    if (currentTarget) {
      for (let i = start; i <= end; i++) {
        const s = this.matchScore(spokenWords[i], currentTarget, interim);
        if (s >= this.threshold(currentTarget.clean, interim)) {
          anchorCandidates.push({ spokenIdx: i, textIdx: this.currentWordIndex, initialScore: s });
        }
      }
    }

    // Prioridad 2: si no se encontró en la palabra actual, comprobar palabra inmediatamente siguiente
    // (maneja casos de recorte del micrófono al iniciar la frase o palabra muy breve)
    if (anchorCandidates.length === 0 && this.currentWordIndex + 1 < this.totalWords) {
      const nextTarget = this.tokens[this.currentWordIndex + 1];
      if (nextTarget) {
        for (let i = start; i <= end; i++) {
          const s = this.matchScore(spokenWords[i], nextTarget, interim);
          if (s >= this.threshold(nextTarget.clean, interim)) {
            anchorCandidates.push({ spokenIdx: i, textIdx: this.currentWordIndex + 1, initialScore: s });
          }
        }
      }
    }

    // Prioridad 3: detectar reanudación de lectura en párrafos posteriores (requiere al menos 3 coincidencias consecutivas)
    if (this.currentWordIndex + 2 < this.totalWords) {
      const forwardLimit = Math.min(this.totalWords, this.currentWordIndex + 25);
      for (let tIdx = this.currentWordIndex + 2; tIdx < forwardLimit; tIdx++) {
        const target = this.tokens[tIdx];
        if (!target || target.clean.length <= 3) continue; // Nunca anclar saltos en palabras vacías cortas
        for (let i = start; i <= end; i++) {
          const s = this.matchScore(spokenWords[i], target, interim);
          if (s >= 0.88) {
            anchorCandidates.push({ spokenIdx: i, textIdx: tIdx, initialScore: s });
          }
        }
      }
    }

    // Evaluar cada candidato avanzando secuencialmente desde el ancla encontrado
    for (const cand of anchorCandidates) {
      let pointer = cand.textIdx + 1;
      let matches = 1;

      for (let i = cand.spokenIdx + 1; i < spokenWords.length && pointer < this.totalWords; i++) {
        const spoken = spokenWords[i];
        const expected = this.tokens[pointer];
        const s = this.matchScore(spoken, expected, interim);
        const needed = this.threshold(expected.clean, interim);

        if (s >= needed) {
          pointer++;
          matches++;
          continue;
        }

        // Permite como máximo saltar una palabra en reconocimiento provisional
        // y dos en un resultado más estable, exigiendo similitud alta (>= 0.92)
        const maxLookAhead = interim ? 1 : 2;
        let bestLookIndex = -1;
        let bestLookScore = 0;

        for (let offset = 1; offset <= maxLookAhead; offset++) {
          const cIndex = pointer + offset;
          if (cIndex >= this.totalWords) break;
          const candidateToken = this.tokens[cIndex];
          const cScore = this.matchScore(spoken, candidateToken, interim);
          if (cScore > bestLookScore) {
            bestLookScore = cScore;
            bestLookIndex = cIndex;
          }
        }

        if (bestLookIndex >= 0 && bestLookScore >= 0.92) {
          pointer = bestLookIndex + 1;
          matches++;
        }
      }

      // Si el anclaje fue más allá de la palabra actual o la siguiente, exigir al menos 3 coincidencias
      if (cand.textIdx > this.currentWordIndex + 1 && matches < 3) {
        continue;
      }

      if (matches > bestMatches || (matches === bestMatches && pointer > bestPointer)) {
        bestMatches = matches;
        bestPointer = pointer;
      }
    }

    return bestPointer;
  }

  /**
   * Procesa el texto reconocido (visual o interino) y actualiza el avance si hay progreso.
   */
  public processTranscript(text: string, interim: boolean): void {
    if (!text || this.currentWordIndex >= this.totalWords) return;

    const spoken = text
      .split(/\s+/)
      .map((w) => normalizeSpanishWord(w))
      .filter((w) => Boolean(w) && !this.isFiller(w));

    if (!spoken.length) return;

    const next = this.calculateIndex(spoken, interim);

    if (next > this.currentWordIndex) {
      this.setCurrentWordIndex(next);
    }
  }

  /**
   * Aplica el avance del índice actual garantizando consistencia, métricas y auto-scroll
   */
  public setCurrentWordIndex(next: number): void {
    const target = Math.min(Math.max(next, this.currentWordIndex), this.totalWords);
    if (target === this.currentWordIndex) return;

    const initialWordIndex = this.currentWordIndex;
    this.currentWordIndex = target;
    this.confirmedWordIndex = target;
    this.confirmedMatchedWords = target;
    this.previewWordIndex = target;

    this.updateLiveWpm();
    this.scrollToCurrentWord();

    // Efectos de sonido si aplica
    if (this.soundEffects && this.mode !== 'mic') {
      this.speechService.playWordChime();
    }

    // Comprobar si se completó la lectura
    if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
      this.finishReading();
    }
  }

  /**
   * Compatibilidad hacia atrás para el motor de alineación
   */
  public alignBandedDP(
    baseIndex: number,
    spokenTokens: string[],
    candidateAlts?: string[]
  ): { targetIndex: number; matchedCount: number } {
    if (!spokenTokens || spokenTokens.length === 0 || baseIndex >= this.totalWords) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }
    const cleanTokens = spokenTokens.filter((t) => !this.isFiller(t));
    if (cleanTokens.length === 0) {
      return { targetIndex: baseIndex, matchedCount: 0 };
    }
    const prevIndex = this.currentWordIndex;
    this.currentWordIndex = baseIndex;
    const next = this.calculateIndex(cleanTokens, false);
    this.currentWordIndex = prevIndex;
    return {
      targetIndex: next,
      matchedCount: Math.max(0, next - baseIndex),
    };
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
   * Procesa eventos de tokens con el motor de alta precisión de preview.html
   */
  private processSpeechTokens(event: SpeechTokensEvent): void {
    if (this.currentWordIndex >= this.totalWords) return;

    let transcriptText = event.rawTranscript || '';
    if (!transcriptText) {
      const combined = [...(event.finalTokens || []), ...(event.interimTokens || [])];
      transcriptText = combined.join(' ');
    }

    const isInterim =
      event.isInterim !== undefined
        ? event.isInterim
        : Boolean(event.interimTokens && event.interimTokens.length > 0);

    // Actualizar liveSpokenText para el indicador visual responsivo
    if (event.interimTokens && event.interimTokens.length > 0) {
      this.liveSpokenText = event.interimTokens.slice(-14).join(' ');
    } else if (event.finalTokens && event.finalTokens.length > 0) {
      this.liveSpokenText = event.finalTokens.slice(-8).join(' ');
    } else if (transcriptText) {
      this.liveSpokenText = transcriptText.split(/\s+/).slice(-10).join(' ');
    } else {
      this.liveSpokenText = '';
    }

    this.processTranscript(transcriptText, isInterim);
    this.previewWordIndex = this.currentWordIndex;
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
