import { Injectable, NgZone, inject } from '@angular/core';

export interface SpeechRecognitionState {
  isListening: boolean;
  isPaused: boolean;
  transcript: string;
  interimTranscript: string;
  wordsSpokenCount: number;
  currentWpm: number;
  error: string | null;
  supported: boolean;
}

/**
 * Normaliza palabras en español para comparación fonética y ortográfica robusta.
 * Elimina tildes, signos de puntuación de apertura/cierre y convierte a minúsculas.
 */
export function normalizeSpanishWord(word: string): string {
  if (!word) return '';
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y diéresis
    .replace(/[.,;:¿?¡!—«»"'\(\)\[\]\-–\/\\#@_~`]/g, '') // Elimina puntuación española
    .trim();
}

/**
 * Distancia de Levenshtein para tolerancia de pronunciación y errores del micrófono.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Sustitución
          matrix[i][j - 1] + 1,     // Inserción
          matrix[i - 1][j] + 1      // Eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Coincidencia fonética avanzada adaptada al español de Guatemala y Latinoamérica.
 * Tolera seseo (c/z <-> s), betacismo (b <-> v), yeísmo (ll <-> y) y hache muda.
 */
export function isPhoneticMatch(spokenRaw: string, targetRaw: string): boolean {
  const s = normalizeSpanishWord(spokenRaw);
  const t = normalizeSpanishWord(targetRaw);

  if (s === t) return true;
  if (!s || !t) return false;

  // Palabras muy cortas (1-2 letras: "de", "la", "el", "en", "un", "y", "a")
  if (t.length <= 2) {
    return s === t;
  }

  // Normalización fonética latinoamericana
  const phonetic = (w: string) =>
    w
      .replace(/v/g, 'b')
      .replace(/[cz]/g, 's')
      .replace(/ll/g, 'y')
      .replace(/^h/, '');

  if (phonetic(s) === phonetic(t)) return true;

  // Tolerancia de prefijos/sufijos (plurales o desinencias verbales leídas)
  if (s.startsWith(t) || t.startsWith(s)) {
    if (Math.abs(s.length - t.length) <= 2) return true;
  }

  // Distancia Levenshtein adaptada a la longitud
  const dist = levenshteinDistance(s, t);
  if (t.length >= 6 && dist <= 2) return true;
  if (t.length >= 3 && dist <= 1) return true;

  return false;
}

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  private ngZone = inject(NgZone);
  private recognition: any = null;
  private isListening = false;
  private isPaused = false;
  private fullTranscript = '';
  private interimTranscript = '';
  private startTime: number | null = null;
  private pausedDuration = 0;
  private pauseTimestamp: number | null = null;
  private simulationInterval: any = null;

  // Web Audio Context para efectos de gamificación
  private audioCtx: AudioContext | null = null;
  public soundEffectsEnabled = true;

  // Narrador pedagógico (SpeechSynthesis)
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public onStateChange?: (state: SpeechRecognitionState) => void;
  public onWordsUpdated?: (words: string[], wpm: number, recentPhrase?: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'es-GT';

          this.recognition.onresult = (event: any) => {
            this.ngZone.run(() => {
              let currentInterim = '';
              let recentSegment = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPiece = event.results[i][0].transcript;
                recentSegment += ' ' + transcriptPiece;
                if (event.results[i].isFinal) {
                  this.fullTranscript += ' ' + transcriptPiece;
                } else {
                  currentInterim += transcriptPiece;
                }
              }
              this.interimTranscript = currentInterim;
              this.emitUpdate(null, recentSegment.trim());
            });
          };

          this.recognition.onerror = (event: any) => {
            this.ngZone.run(() => {
              console.warn('SpeechRecognition error:', event.error);
              this.emitUpdate(
                event.error === 'not-allowed'
                  ? 'Permiso de micrófono denegado en el navegador'
                  : event.error
              );
            });
          };

          this.recognition.onend = () => {
            this.ngZone.run(() => {
              if (this.isListening && !this.isPaused) {
                try {
                  this.recognition.start();
                } catch (err) {
                  // Ya en ejecución
                }
              }
            });
          };
        } catch (err) {
          console.warn('Speech recognition no inicializado:', err);
        }
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public start(): boolean {
    this.stopNarrator();
    this.fullTranscript = '';
    this.interimTranscript = '';
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.pauseTimestamp = null;
    this.isListening = true;
    this.isPaused = false;

    if (this.recognition) {
      try {
        this.recognition.start();
        this.emitUpdate();
        return true;
      } catch (err) {
        console.warn('SpeechRecognition start failed, se habilitará modo asistido:', err);
      }
    }
    this.emitUpdate();
    return false;
  }

  public pause(): void {
    if (!this.isListening || this.isPaused) return;
    this.isPaused = true;
    this.pauseTimestamp = Date.now();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.emitUpdate();
  }

  public resume(): void {
    if (!this.isListening || !this.isPaused) return;
    this.isPaused = false;
    if (this.pauseTimestamp) {
      this.pausedDuration += Date.now() - this.pauseTimestamp;
      this.pauseTimestamp = null;
    }
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
    this.emitUpdate();
  }

  public stop(): void {
    this.isListening = false;
    this.isPaused = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.emitUpdate();
  }

  public startAssistedSimulation(
    targetWords: string[],
    targetWpm: number,
    onProgress: (currentWordIndex: number) => void
  ): void {
    this.stop();
    this.stopNarrator();
    this.isListening = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;

    let wordIdx = 0;
    const msPerWord = Math.max(160, Math.floor((60 / targetWpm) * 1000));

    this.simulationInterval = setInterval(() => {
      this.ngZone.run(() => {
        if (this.isPaused) return;
        if (wordIdx >= targetWords.length) {
          clearInterval(this.simulationInterval);
          this.simulationInterval = null;
          this.stop();
          return;
        }
        this.fullTranscript += ' ' + targetWords[wordIdx];
        wordIdx++;
        onProgress(wordIdx);
        this.emitUpdate();
      });
    }, msPerWord);

    this.emitUpdate();
  }

  /* =====================================================================
   * NARRADOR PEDAGÓGICO DE LECTURA MODELO (SpeechSynthesis)
   * ===================================================================== */

  public playNarrator(
    text: string,
    rate = 1.0,
    onBoundary?: (charIndex: number) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.synth) return false;
    this.stopNarrator();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-GT';
    utterance.rate = rate; // 0.8 lenta, 1.0 normal, 1.2 rápida
    utterance.pitch = 1.0;

    // Buscar voz en español natural
    const voices = this.synth.getVoices();
    const esVoice =
      voices.find((v) => v.lang === 'es-GT' || v.lang === 'es-MX' || v.lang.startsWith('es-419')) ||
      voices.find((v) => v.lang.startsWith('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    if (onBoundary) {
      utterance.onboundary = (e: any) => {
        this.ngZone.run(() => onBoundary(e.charIndex));
      };
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) this.ngZone.run(() => onEnd());
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public pauseNarrator(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resumeNarrator(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stopNarrator(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isNarrating(): boolean {
    return Boolean(this.synth && (this.synth.speaking || this.synth.pending));
  }

  /* =====================================================================
   * EFECTOS DE AUDIO SINTETIZADOS (Web Audio API - Cero dependencias)
   * ===================================================================== */

  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playWordChime(): void {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 suave
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  public playMilestoneSound(): void {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch (e) {}
  }

  public playVictoryFanfare(): void {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Secuencia armónica triunfal Kinal (Do mayor brillante: C5, E5, G5, C6)
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    } catch (e) {}
  }

  /* =====================================================================
   * CÁLCULO DE PALABRAS POR MINUTO (PPM)
   * ===================================================================== */

  private calculateWpm(): number {
    if (!this.startTime) return 0;
    const now = this.pauseTimestamp || Date.now();
    const activeSeconds = Math.max(1, (now - this.startTime - this.pausedDuration) / 1000);
    const words = (this.fullTranscript + ' ' + this.interimTranscript)
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return Math.round((words.length / activeSeconds) * 60);
  }

  private emitUpdate(errorMessage: string | null = null, recentPhrase?: string): void {
    const combined = (this.fullTranscript + ' ' + this.interimTranscript).trim();
    const words = combined ? combined.split(/\s+/).filter(Boolean) : [];
    const currentWpm = this.calculateWpm();

    if (this.onWordsUpdated) {
      this.onWordsUpdated(words, currentWpm, recentPhrase);
    }

    if (this.onStateChange) {
      this.onStateChange({
        isListening: this.isListening,
        isPaused: this.isPaused,
        transcript: combined,
        interimTranscript: this.interimTranscript,
        wordsSpokenCount: words.length,
        currentWpm,
        error: errorMessage,
        supported: this.isSupported(),
      });
    }
  }
}
