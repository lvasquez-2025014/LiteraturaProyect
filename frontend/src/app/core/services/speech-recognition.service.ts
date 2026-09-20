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
 * Elimina acentos, tildes (é, á, í, ó, ú), diéresis, signos de puntuación tipográfica y símbolos.
 */
export function normalizeSpanishWord(word: string): string {
  if (!word) return '';
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes, acentos agudos, graves y diéresis
    .replace(/[^\p{L}\p{N}]/gu, '')  // Remueve cualquier signo de puntuación, comillas tipográficas, guiones o símbolos
    .trim();
}

/**
 * Distancia de Levenshtein para tolerancia de pronunciación y ruido de micrófono.
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
 * Mapeo exhaustivo de números y dígitos en español y números romanos
 * comunes en lecturas y capítulos literarios.
 */
export const NUMBER_WORD_MAP: Record<string, string[]> = {
  '0': ['cero'],
  '1': ['uno', 'un', 'una', 'primero', 'primera', 'primer'],
  '2': ['dos', 'segundo', 'segunda', 'ii'],
  '3': ['tres', 'tercero', 'tercera', 'tercer', 'iii'],
  '4': ['cuatro', 'cuarto', 'cuarta', 'iv'],
  '5': ['cinco', 'quinto', 'quinta'],
  '6': ['seis', 'sexto', 'sexta', 'vi'],
  '7': ['siete', 'septimo', 'septima', 'vii'],
  '8': ['ocho', 'octavo', 'octava', 'viii'],
  '9': ['nueve', 'noveno', 'novena', 'ix'],
  '10': ['diez', 'decimo', 'decima'],
  '11': ['once', 'xi'],
  '12': ['doce', 'xii'],
  '13': ['trece', 'xiii'],
  '14': ['catorce', 'xiv'],
  '15': ['quince', 'xv'],
  '16': ['dieciseis', 'xvi'],
  '17': ['diecisiete', 'xvii'],
  '18': ['dieciocho', 'xviii'],
  '19': ['diecinueve', 'xix'],
  '20': ['veinte', 'xx'],
  '21': ['veintiuno', 'veintiun', 'veintiuna', 'xxi'],
  '30': ['treinta', 'xxx'],
  '40': ['cuarenta', 'xl'],
  '50': ['cincuenta'],
  '100': ['cien', 'ciento'],
  '500': ['quinientos'],
  '1000': ['mil'],
};

/**
 * Normalización fonética completa adaptada a Guatemala y Latinoamérica:
 * - Seseo: c (ante e, i), z -> s
 * - Betacismo: b, v, w -> b
 * - Yeísmo: ll, y -> y
 * - K/Q: qu (ante e, i), k, c (ante a, o, u) -> k
 * - G/J: g (ante e, i), j -> j
 * - Hache muda: h -> eliminada (salvo dígrafo 'ch')
 * - Fonética maya / guatemalteca:
 *     - tz -> ch o ts (e.g. Quetzal, Atitlán)
 *     - w -> b / hu / u (e.g. Popol Wuj <-> Popol Vuh)
 *     - x en topónimos mayas (Xela, Xibalbá) -> j o sh o s
 * - Reducción de consonantes dobles (excepto 'rr')
 */
export function toPhoneticKey(word: string): string {
  let w = normalizeSpanishWord(word);
  if (!w) return '';

  // 1. Proteger dígrafos y fonemas mayas antes de sustituir caracteres individuales
  w = w
    .replace(/ch/g, 'Ç')
    .replace(/tz/g, 'Ç')
    .replace(/ts/g, 'Ç')
    .replace(/sh/g, 'Ç')
    .replace(/qu(?=[ei])/g, 'k')
    .replace(/gu(?=[ei])/g, 'g')
    .replace(/ll/g, 'y');

  // 2. Fonética estándar latinoamericana
  w = w
    .replace(/v/g, 'b')
    .replace(/w/g, 'b')
    .replace(/c(?=[ei])/g, 's')
    .replace(/z/g, 's')
    .replace(/c(?=[aou])/g, 'k')
    .replace(/c$/g, 'k')
    .replace(/g(?=[ei])/g, 'j')
    .replace(/x/g, 's')
    .replace(/h/g, '')
    .replace(/Ç/g, 'ch');

  // 3. Reducción de consonantes geminadas (excepto 'rr' que tiene valor fonémico)
  w = w.replace(/([^r])\1+/g, '$1');

  return w;
}

/**
 * Coincidencia fonética avanzada adaptada al español de Guatemala y Latinoamérica.
 * Tolera seseo (c/z <-> s), betacismo (b <-> v), yeísmo (ll <-> y), hache muda,
 * variantes indígenas/mayas (tz <-> ch/ts/z) y palabras con o sin tilde diacrítica.
 */
export function isPhoneticMatch(spokenRaw: string, targetRaw: string): boolean {
  const s = normalizeSpanishWord(spokenRaw);
  const t = normalizeSpanishWord(targetRaw);

  if (!s || !t) return false;
  if (s === t) return true;

  // 1. Números y dígitos (ej. "3" <-> "tres", "1" <-> "un", "xxi" <-> "veintiuno")
  if (NUMBER_WORD_MAP[s]?.includes(t) || NUMBER_WORD_MAP[t]?.includes(s)) {
    return true;
  }
  for (const [digit, words] of Object.entries(NUMBER_WORD_MAP)) {
    const list = [digit, ...words];
    if (list.includes(s) && list.includes(t)) {
      return true;
    }
  }

  // 2. Normalización fonética completa (seseo, betacismo, yeísmo, hache muda, mayismos)
  const ps = toPhoneticKey(s);
  const pt = toPhoneticKey(t);
  if (ps === pt) return true;

  // 3. Palabras muy cortas (1 o 2 letras: "el", "la", "de", "en", "un", "al", "se", "si", "su", "tu", "ya")
  if (s.length <= 2 || t.length <= 2) {
    return ps === pt;
  }

  // 4. Tolerancia de plurales / singulares (e.g. "ala" <-> "alas", "cedro" <-> "cedros")
  if (s === t + 's' || s === t + 'es' || t === s + 's' || t === s + 'es') return true;
  if (ps === pt + 's' || ps === pt + 'es' || pt === ps + 's' || pt === ps + 'es') return true;

  // 5. Tolerancia de raíces léxicas y número gramatical (-s / -es) para palabras >= 4 caracteres
  const stemS = ps.length >= 4 && ps.endsWith('s') ? ps.slice(0, -1) : ps;
  const stemT = pt.length >= 4 && pt.endsWith('s') ? pt.slice(0, -1) : pt;
  if (stemS === stemT) return true;

  // 6. Equivalencia acústica bilabial (p <-> b / v / w) adaptada al habla continua:
  // Los motores ASR con frecuencia sustituyen bilabiales en palabras literarias (ej. "cumbres" <-> "compre", "cobre", "compres", etc.)
  const bps = stemS.replace(/p/g, 'b');
  const bpt = stemT.replace(/p/g, 'b');
  if (bps === bpt) return true;

  const stemDist = levenshteinDistance(bps, bpt);
  const stemMaxLen = Math.max(bps.length, bpt.length);
  if (bps[0] === bpt[0]) {
    if (stemDist <= 1 && stemMaxLen >= 4) return true;
    if (stemDist <= 2 && stemMaxLen >= 6) return true;
  } else {
    if (stemDist <= 1 && stemMaxLen >= 6) return true;
  }

  // 7. Tolerancia Levenshtein adaptativa:
  const maxLen = Math.max(s.length, t.length);
  const pMaxLen = Math.max(ps.length, pt.length);

  // Palabras de 3 a 5 letras: tolerancia distancia <= 1
  const rawDist = levenshteinDistance(s, t);
  if (rawDist <= 1 && maxLen >= 3) return true;

  const phoneDist = levenshteinDistance(ps, pt);
  if (phoneDist <= 1 && pMaxLen >= 3) return true;

  // Palabras medianas y largas (>= 6 letras): permitir distancia <= 2 o similitud >= 75%
  if (pMaxLen >= 6) {
    if (phoneDist <= 2) return true;
    const similarity = 1 - phoneDist / pMaxLen;
    if (similarity >= 0.75) return true;
  }

  // Palabras muy largas (>= 9 letras): permitir distancia <= 3
  if (pMaxLen >= 9 && phoneDist <= 3) {
    return true;
  }

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
  private accumulatedFinalText = '';
  private startTime: number | null = null;
  private pausedDuration = 0;
  private pauseTimestamp: number | null = null;
  private restartTimeout: any = null;

  // Motor de simulación guiada para modo asistido
  private isAssistedMode = false;
  private assistedWords: string[] = [];
  private assistedTargetWpm = 130;
  private assistedWordIdx = 0;
  private assistedCallback?: (currentWordIndex: number) => void;
  private assistedTimeout: any = null;
  private assistedSpeedMultiplier = 1.0;

  // Web Audio Context para efectos de gamificación
  private audioCtx: AudioContext | null = null;
  public soundEffectsEnabled = true;

  // Narrador pedagógico (SpeechSynthesis)
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private utteranceCounter = 0;
  private lastResultIndex = -1;

  public onStateChange?: (state: SpeechRecognitionState) => void;
  public onWordsUpdated?: (
    words: string[],
    wpm: number,
    activeTokens?: string[],
    candidateAlts?: string[],
    utteranceId?: number
  ) => void;

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
          this.recognition.maxAlternatives = 5;
          // 'es-419' (Español de Latinoamérica) proporciona el modelo ASR con el léxico literario más amplio
          // en los servidores de voz de Google/Chrome, reduciendo sustituciones coloquiales no deseadas
          this.recognition.lang = 'es-419';

          this.recognition.onresult = (event: any) => {
            this.ngZone.run(() => {
              if (event.resultIndex !== this.lastResultIndex) {
                this.lastResultIndex = event.resultIndex;
                this.utteranceCounter++;
              }

              let currentInterim = '';
              const activeTokens: string[] = [];
              const candidateAlts: string[] = [];

              // Extraer tokens de todos los resultados desde resultIndex hasta el final
              // (Garantiza que ningún token finalizado se pierda cuando Chrome divide en múltiples segmentos)
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                const res = event.results[i];
                const top = res[0]?.transcript || '';
                if (top) {
                  activeTokens.push(...top.trim().split(/\s+/).filter(Boolean));
                }
                for (let a = 1; a < res.length; ++a) {
                  const alt = res[a]?.transcript;
                  if (alt) {
                    candidateAlts.push(...alt.trim().split(/\s+/).filter(Boolean));
                  }
                }
              }

              // Calcular transcripción completa acumulada
              let currentSessionFinal = '';
              for (let i = 0; i < event.results.length; ++i) {
                const res = event.results[i];
                if (res.isFinal) {
                  currentSessionFinal += (currentSessionFinal ? ' ' : '') + (res[0]?.transcript || '');
                } else {
                  currentInterim += (currentInterim ? ' ' : '') + (res[0]?.transcript || '');
                }
              }

              this.fullTranscript = (this.accumulatedFinalText + ' ' + currentSessionFinal).trim();
              this.interimTranscript = currentInterim.trim();

              this.emitUpdate(null, activeTokens, candidateAlts, this.utteranceCounter);
            });
          };

          this.recognition.onerror = (event: any) => {
            this.ngZone.run(() => {
              if (event.error === 'no-speech' || event.error === 'aborted') {
                // Pausas naturales del estudiante o reinicios; no son fallas críticas
                return;
              }
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
              this.accumulatedFinalText = this.fullTranscript;
              this.lastResultIndex = -1;
              this.scheduleRestart();
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

  private scheduleRestart(): void {
    if (!this.isListening || this.isPaused) return;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    this.restartTimeout = setTimeout(() => {
      if (this.isListening && !this.isPaused && this.recognition) {
        try {
          this.recognition.start();
        } catch (err) {
          // Reintentar si el canal de audio tardó en liberarse
          this.restartTimeout = setTimeout(() => {
            if (this.isListening && !this.isPaused && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {}
            }
          }, 150);
        }
      }
    }, 60);
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public setAssistedSpeedMultiplier(multiplier: number): void {
    this.assistedSpeedMultiplier = Math.max(0.5, Math.min(2.0, multiplier));
  }

  public getAssistedWordIndex(): number {
    return this.assistedWordIdx;
  }

  public start(): boolean {
    this.stopNarrator();
    this.isAssistedMode = false;
    this.fullTranscript = '';
    this.interimTranscript = '';
    this.accumulatedFinalText = '';
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.pauseTimestamp = null;
    this.isListening = true;
    this.isPaused = false;
    this.utteranceCounter = 0;
    this.lastResultIndex = -1;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.assistedTimeout) {
      clearTimeout(this.assistedTimeout);
      this.assistedTimeout = null;
    }

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
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.assistedTimeout) {
      clearTimeout(this.assistedTimeout);
      this.assistedTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
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
    if (this.isAssistedMode) {
      this.scheduleNextAssistedWord();
    } else if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        this.scheduleRestart();
      }
    }
    this.emitUpdate();
  }

  public stop(): void {
    this.isListening = false;
    this.isPaused = false;
    this.isAssistedMode = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.assistedTimeout) {
      clearTimeout(this.assistedTimeout);
      this.assistedTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
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
    this.isAssistedMode = true;
    this.assistedWords = targetWords;
    this.assistedTargetWpm = targetWpm;
    this.assistedWordIdx = 0;
    this.assistedCallback = onProgress;
    this.fullTranscript = '';
    this.interimTranscript = '';
    this.accumulatedFinalText = '';
    this.isListening = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.pauseTimestamp = null;

    this.scheduleNextAssistedWord();
    this.emitUpdate();
  }

  private scheduleNextAssistedWord(): void {
    if (!this.isAssistedMode || this.isPaused || !this.isListening) return;
    if (this.assistedWordIdx >= this.assistedWords.length) {
      this.stop();
      return;
    }

    const currentWord = this.assistedWords[this.assistedWordIdx];
    const effectiveWpm = Math.max(60, Math.min(300, Math.round(this.assistedTargetWpm * this.assistedSpeedMultiplier)));
    const baseMs = Math.floor((60 / effectiveWpm) * 1000);

    // Pausas naturales pedagógicas según puntuación (evita sensación robótica acelerada)
    let delay = baseMs;
    if (/[,\:\;]$/.test(currentWord)) {
      delay += 220; // Pausa natural en comas
    } else if (/[\.\!\?]$/.test(currentWord)) {
      delay += 450; // Pausa natural al final de oración
    }

    this.assistedTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        if (!this.isAssistedMode || this.isPaused || !this.isListening) return;

        this.assistedWordIdx++;
        if (this.assistedCallback) {
          this.assistedCallback(this.assistedWordIdx);
        }
        this.emitUpdate();

        if (this.assistedWordIdx < this.assistedWords.length) {
          this.scheduleNextAssistedWord();
        } else {
          this.stop();
        }
      });
    }, delay);
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
    const activeSeconds = Math.max(2, (now - this.startTime - this.pausedDuration) / 1000);
    const wordsCount = this.isAssistedMode
      ? this.assistedWordIdx
      : (this.fullTranscript + ' ' + this.interimTranscript).trim().split(/\s+/).filter(Boolean).length;
    const raw = Math.round((wordsCount / activeSeconds) * 60);
    return Math.min(450, Math.max(0, raw));
  }

  private emitUpdate(
    errorMessage: string | null = null,
    activeTokens?: string[],
    candidateAlts?: string[],
    utteranceId?: number
  ): void {
    const combined = (this.fullTranscript + ' ' + this.interimTranscript).trim();
    const words = combined ? combined.split(/\s+/).filter(Boolean) : [];
    const currentWpm = this.calculateWpm();

    if (this.onWordsUpdated) {
      this.onWordsUpdated(words, currentWpm, activeTokens, candidateAlts, utteranceId);
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
