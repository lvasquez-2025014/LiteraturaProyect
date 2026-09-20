import { Injectable, NgZone, inject } from '@angular/core';

export interface SpeechRecognitionState {
  isListening: boolean;
  isPaused: boolean;
  isMicReady: boolean;
  isAudioActive: boolean;
  transcript: string;
  interimTranscript: string;
  wordsSpokenCount: number;
  currentWpm: number;
  error: string | null;
  supported: boolean;
}

export interface SpeechTokensEvent {
  finalTokens: string[];
  interimTokens: string[];
  candidateAlts: string[];
  wordsSpokenCount: number;
  currentWpm: number;
  isAudioActive?: boolean;
}

/**
 * Normaliza palabras en español para comparación fonética y ortográfica robusta.
 * Elimina acentos, tildes (é, á, í, ó, ú), diéresis, signos de puntuación tipográfica,
 * comillas (latinas, curvas y rectas), rayas de diálogo y símbolos.
 */
export function normalizeSpanishWord(word: string): string {
  if (!word) return '';
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes y diéresis
    .replace(/[^\p{L}\p{N}]/gu, '')  // Remueve cualquier signo de puntuación o símbolo
    .trim();
}

/**
 * Distancia de Levenshtein para tolerancia de pronunciación y ruido acústico.
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

const CARDINAL_ONES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const CARDINAL_TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
const CARDINAL_TENS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CARDINAL_HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

/**
 * Convierte un número entero (0 a 9999) en su representación en palabras en español.
 */
export function numberToSpanishWords(n: number): string[] {
  if (n === 0) return ['cero'];
  if (n === 100) return ['cien'];
  const words: string[] = [];

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) {
      words.push('mil');
    } else {
      words.push(...numberToSpanishWords(thousands));
      words.push('mil');
    }
    n %= 1000;
  }

  if (n >= 100) {
    if (n === 100) {
      words.push('cien');
      n = 0;
    } else {
      words.push(CARDINAL_HUNDREDS[Math.floor(n / 100)]);
      n %= 100;
    }
  }

  if (n >= 20) {
    if (n === 20) {
      words.push('veinte');
      n = 0;
    } else if (n < 30) {
      words.push('veinti' + CARDINAL_ONES[n - 20]);
      n = 0;
    } else {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      if (one === 0) {
        words.push(CARDINAL_TENS[ten]);
      } else {
        words.push(CARDINAL_TENS[ten]);
        words.push('y');
        words.push(CARDINAL_ONES[one]);
      }
      n = 0;
    }
  } else if (n >= 10) {
    words.push(CARDINAL_TEENS[n - 10]);
    n = 0;
  } else if (n > 0) {
    words.push(CARDINAL_ONES[n]);
    n = 0;
  }

  return words;
}

export const ROMAN_NUMERALS_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16, xvii: 17, xviii: 18, xix: 19, xx: 20,
  xxi: 21, xxii: 22, xxiii: 23, xxiv: 24, xxv: 25, xxx: 30, xl: 40, l: 50, c: 100, d: 500, m: 1000,
};

export const COMMON_CONTRACTIONS: Record<string, string[]> = {
  para: ['pa', 'pra'],
  donde: ['onde'],
  estaba: ['taba', 'tava'],
  esta: ['ta'],
  entonces: ['tonces', 'entonce', 'entonse'],
  nada: ['na'],
  bueno: ['bue'],
  senor: ['sr'],
  senora: ['sra'],
  doctor: ['dr'],
  del: ['de', 'el'],
  al: ['a', 'el'],
};

export const SPANISH_WORD_TO_DIGIT_MAP: Record<string, string> = {
  cero: '0',
  un: '1', uno: '1', una: '1', primero: '1', primera: '1', primer: '1',
  dos: '2', segundo: '2', segunda: '2',
  tres: '3', tercero: '3', tercera: '3', tercer: '3',
  cuatro: '4', cuarto: '4', cuarta: '4',
  cinco: '5', quinto: '5', quinta: '5',
  seis: '6', sexto: '6', sexta: '6',
  siete: '7', septimo: '7', septima: '7',
  ocho: '8', octavo: '8', octava: '8',
  nueve: '9', noveno: '9', novena: '9',
  diez: '10', decimo: '10', decima: '10',
  once: '11', doce: '12', trece: '13', catorce: '14', quince: '15',
  dieciseis: '16', diecisiete: '17', dieciocho: '18', diecinueve: '19',
  veinte: '20', veintiuno: '21', veintiun: '21', veintiuna: '21',
  treinta: '30', cuarenta: '40', cincuenta: '50',
  cien: '100', ciento: '100', quinientos: '500', mil: '1000',
};

export const SPANISH_STOPWORDS = new Set<string>([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
  'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus',
  'le', 'ya', 'o', 'este', 'si', 'porque', 'esta', 'son', 'entre',
  'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'tambien', 'me', 'hasta',
  'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno',
  'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto',
  'mi', 'antes', 'algunos', 'que', 'unos', 'unas'
]);

export function isSpanishStopword(rawWord: string): boolean {
  const norm = normalizeSpanishWord(rawWord);
  return SPANISH_STOPWORDS.has(norm);
}

/**
 * Retorna las formas equivalentes fonéticas y orales de una palabra (números, romanos, contracciones).
 */
export function getWordEquivalents(rawWord: string): string[] {
  const norm = normalizeSpanishWord(rawWord);
  if (!norm) return [];
  const list = new Set<string>([norm]);

  // Números romanos
  if (ROMAN_NUMERALS_MAP[norm]) {
    const num = ROMAN_NUMERALS_MAP[norm];
    list.add(String(num));
    if (num === 1) {
      list.add('un');
      list.add('uno');
      list.add('una');
      list.add('primero');
    }
    const words = numberToSpanishWords(num);
    words.forEach(w => list.add(normalizeSpanishWord(w)));
    list.add(words.map(w => normalizeSpanishWord(w)).join(''));
    list.add(words.map(w => normalizeSpanishWord(w)).join(' '));
    if (num === 1) list.add('primero');
    if (num === 2) list.add('segundo');
    if (num === 3) list.add('tercero');
    if (num === 4) list.add('cuarto');
    if (num === 5) list.add('quinto');
    if (num === 6) list.add('sexto');
    if (num === 7) list.add('septimo');
    if (num === 8) list.add('octavo');
    if (num === 9) list.add('noveno');
    if (num === 10) list.add('decimo');
  }

  // Dígitos arábigos (ej. "1", "1821", "250", "3")
  if (/^\d+$/.test(norm)) {
    const num = parseInt(norm, 10);
    if (num === 1) {
      list.add('un');
      list.add('uno');
      list.add('una');
      list.add('primero');
      list.add('primer');
    }
    if (num <= 9999) {
      const words = numberToSpanishWords(num);
      words.forEach(w => list.add(normalizeSpanishWord(w)));
      list.add(words.map(w => normalizeSpanishWord(w)).join(''));
      list.add(words.map(w => normalizeSpanishWord(w)).join(' '));
    }
  }

  // Si la palabra es un número escrito en palabras (ej. "uno", "tres", "quince")
  if (SPANISH_WORD_TO_DIGIT_MAP[norm]) {
    const digit = SPANISH_WORD_TO_DIGIT_MAP[norm];
    list.add(digit);
    if (digit === '1') {
      list.add('un');
      list.add('uno');
      list.add('una');
      list.add('primero');
    }
  }

  // Contracciones y apócopes
  if (COMMON_CONTRACTIONS[norm]) {
    COMMON_CONTRACTIONS[norm].forEach(c => list.add(normalizeSpanishWord(c)));
  }
  for (const [key, alts] of Object.entries(COMMON_CONTRACTIONS)) {
    if (alts.includes(norm)) {
      list.add(normalizeSpanishWord(key));
    }
  }

  return Array.from(list);
}

/**
 * Normalización fonética completa adaptada a Guatemala y Latinoamérica:
 * - Seseo: c (ante e, i), z -> s
 * - Betacismo: b, v, w -> b
 * - Yeísmo: ll, y -> y
 * - K/Q: qu (ante e, i), k, c (ante a, o, u) -> k
 * - G/J: g (ante e, i), j -> j
 * - Hache muda: h -> eliminada (salvo dígrafo 'ch')
 * - Fonemas mayas y mesoamericanos: tz, ts, sh, x
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
    .replace(/c(?=[^aeious])/g, 'k')
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
 * Calcula una similitud fonética normalizada entre 0.0 y 1.0 entre la palabra hablada y la palabra esperada.
 */
export function computePhoneticSimilarity(spokenRaw: string, targetRaw: string): number {
  const s = normalizeSpanishWord(spokenRaw);
  const t = normalizeSpanishWord(targetRaw);

  if (!s || !t) return 0.0;
  if (s === t) return 1.0;

  // 1. Coincidencia mediante equivalentes numéricos o romanos
  const tEquivs = getWordEquivalents(t);
  if (tEquivs.includes(s)) return 0.98;
  const sEquivs = getWordEquivalents(s);
  if (sEquivs.includes(t)) return 0.98;

  // 2. Llaves fonéticas completas (seseo, betacismo, yeísmo, hache muda)
  const ps = toPhoneticKey(s);
  const pt = toPhoneticKey(t);
  if (ps === pt) return 0.95;

  // 3. Palabras muy cortas (1-2 letras: "de", "la", "el", "en", "al", "un")
  if (s.length <= 2 || t.length <= 2) {
    return ps === pt ? 0.95 : 0.0;
  }

  // 4. Tolerancia de número gramatical regular (singular / plural: -s, -es)
  if (s.length >= 3 && t.length >= 3) {
    if (s === t + 's' || s === t + 'es' || t === s + 's' || t === s + 'es') return 0.92;
    if (ps === pt + 's' || ps === pt + 'es' || pt === ps + 's' || pt === ps + 'es') return 0.92;
  }

  // 5. Coincidencia de prefijo para palabras en curso (ej. "bosq" -> "bosque", min 3 letras)
  if (s.length >= 3 && t.length >= 4) {
    if (t.startsWith(s) || pt.startsWith(ps)) return 0.88;
  }

  // 6. Similitud Levenshtein adaptativa sobre llaves fonéticas
  const pMaxLen = Math.max(ps.length, pt.length);
  const phoneDist = levenshteinDistance(ps, pt);
  const sim = 1.0 - phoneDist / pMaxLen;

  // Palabras medianas y largas (>= 5 letras)
  if (pMaxLen >= 5) {
    if (phoneDist <= 1) return 0.85;
    if (pMaxLen >= 6 && phoneDist <= 2 && sim >= 0.72) return sim * 0.88;
    if (pMaxLen >= 9 && phoneDist <= 3) return 0.76;
  } else if (pMaxLen === 4) {
    if (phoneDist <= 1 && ps[0] === pt[0]) return 0.82;
  } else if (pMaxLen === 3) {
    if (phoneDist <= 1 && ps[0] === pt[0]) return 0.80;
  }

  return 0.0;
}

/**
 * Coincidencia fonética booleana avanzada con umbral optimizado para alta precisión.
 */
export function isPhoneticMatch(spokenRaw: string, targetRaw: string): boolean {
  return computePhoneticSimilarity(spokenRaw, targetRaw) >= 0.75;
}

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  private ngZone = inject(NgZone);
  private recognition: any = null;
  private isListening = false;
  private isPaused = false;
  private isMicReady = false;
  private isAudioActive = false;
  private fullTranscript = '';
  private interimTranscript = '';
  private accumulatedFinalTokens: string[] = [];
  private lastSessionFinalTokens: string[] = [];
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
  public onSpeechTokens?: (event: SpeechTokensEvent) => void;

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

          // Priorizar modelo ASR para Guatemala y Latinoamérica ('es-GT' / 'es-419')
          const navLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : '';
          if (navLang.toLowerCase().startsWith('es')) {
            this.recognition.lang = navLang;
          } else {
            this.recognition.lang = 'es-GT';
          }

          // Eventos de ciclo de vida del audio para retroalimentación visual en vivo
          this.recognition.onstart = () => {
            this.ngZone.run(() => {
              this.isMicReady = true;
              this.emitUpdate();
            });
          };

          this.recognition.onaudiostart = () => {
            this.ngZone.run(() => {
              this.isMicReady = true;
              this.isAudioActive = true;
              this.emitUpdate();
            });
          };

          this.recognition.onsoundstart = () => {
            this.ngZone.run(() => {
              this.isAudioActive = true;
              this.emitUpdate();
            });
          };

          this.recognition.onspeechstart = () => {
            this.ngZone.run(() => {
              this.isAudioActive = true;
              this.emitUpdate();
            });
          };

          this.recognition.onspeechend = () => {
            this.ngZone.run(() => {
              this.isAudioActive = false;
              this.emitUpdate();
            });
          };

          this.recognition.onsoundend = () => {
            this.ngZone.run(() => {
              this.isAudioActive = false;
              this.emitUpdate();
            });
          };

          this.recognition.onaudioend = () => {
            this.ngZone.run(() => {
              this.isAudioActive = false;
              this.emitUpdate();
            });
          };

          this.recognition.onresult = (event: any) => {
            this.ngZone.run(() => {
              this.isAudioActive = true;
              if (event.resultIndex !== this.lastResultIndex) {
                this.lastResultIndex = event.resultIndex;
                this.utteranceCounter++;
              }

              const sessionFinalTokens: string[] = [];
              let currentInterim = '';
              const interimTokens: string[] = [];
              const candidateAlts: string[] = [];

              // Extraer tokens finales e interinos con estricta separación
              for (let i = 0; i < event.results.length; ++i) {
                const res = event.results[i];
                const top = res[0]?.transcript || '';
                if (res.isFinal) {
                  if (top) {
                    sessionFinalTokens.push(...top.trim().split(/\s+/).filter(Boolean));
                  }
                } else {
                  if (top) {
                    currentInterim += (currentInterim ? ' ' : '') + top;
                    interimTokens.push(...top.trim().split(/\s+/).filter(Boolean));
                  }
                }

                // Recopilar hipótesis alternativas del reconocedor de voz (maxAlternatives)
                if (i >= event.resultIndex) {
                  for (let a = 1; a < res.length; ++a) {
                    const alt = res[a]?.transcript;
                    if (alt) {
                      candidateAlts.push(...alt.trim().split(/\s+/).filter(Boolean));
                    }
                  }
                }
              }

              this.lastSessionFinalTokens = sessionFinalTokens;
              const allFinalTokens = [...this.accumulatedFinalTokens, ...sessionFinalTokens];
              this.interimTranscript = currentInterim.trim();
              this.fullTranscript = allFinalTokens.join(' ');

              const currentWpm = this.calculateWpm();

              // Emitir evento estructurado de alta precisión para el lector
              if (this.onSpeechTokens) {
                this.onSpeechTokens({
                  finalTokens: allFinalTokens,
                  interimTokens,
                  candidateAlts,
                  wordsSpokenCount: allFinalTokens.length + interimTokens.length,
                  currentWpm,
                  isAudioActive: this.isAudioActive,
                });
              }

              // Compatibilidad con eventos clásicos
              if (this.onWordsUpdated) {
                const combined = [...allFinalTokens, ...interimTokens];
                this.onWordsUpdated(combined, currentWpm, interimTokens, candidateAlts, this.utteranceCounter);
              }

              if (this.onStateChange) {
                this.onStateChange({
                  isListening: this.isListening,
                  isPaused: this.isPaused,
                  isMicReady: this.isMicReady,
                  isAudioActive: this.isAudioActive,
                  transcript: (this.fullTranscript + ' ' + this.interimTranscript).trim(),
                  interimTranscript: this.interimTranscript,
                  wordsSpokenCount: allFinalTokens.length + interimTokens.length,
                  currentWpm,
                  error: null,
                  supported: this.isSupported(),
                });
              }
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
              // Transferir tokens de sesión finalizados al acumulador permanente
              this.accumulatedFinalTokens = [...this.accumulatedFinalTokens, ...this.lastSessionFinalTokens];
              this.lastSessionFinalTokens = [];
              this.lastResultIndex = -1;
              this.scheduleRestart(true);
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

  private scheduleRestart(immediate = false): void {
    if (!this.isListening || this.isPaused) return;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (immediate && this.recognition) {
      try {
        this.recognition.start();
        return;
      } catch (e) {
        // El hardware de audio del navegador tardará unos milisegundos en liberarse
      }
    }

    this.restartTimeout = setTimeout(() => {
      if (this.isListening && !this.isPaused && this.recognition) {
        try {
          this.recognition.start();
        } catch (err) {
          // Reintento en caliente ultra-rápido
          this.restartTimeout = setTimeout(() => {
            if (this.isListening && !this.isPaused && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {}
            }
          }, 80);
        }
      }
    }, 20);
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
    this.accumulatedFinalTokens = [];
    this.lastSessionFinalTokens = [];
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.pauseTimestamp = null;
    this.isListening = true;
    this.isPaused = false;
    this.isMicReady = false;
    this.isAudioActive = false;
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
    this.isAudioActive = false;
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
    this.isMicReady = false;
    this.isAudioActive = false;
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
    this.accumulatedFinalTokens = [];
    this.lastSessionFinalTokens = [];
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

    // Pausas naturales pedagógicas según puntuación
    let delay = baseMs;
    if (/[,\:\;]$/.test(currentWord)) {
      delay += 220;
    } else if (/[\.\!\?]$/.test(currentWord)) {
      delay += 450;
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
    utterance.rate = rate;
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
      osc.frequency.setValueAtTime(880, ctx.currentTime);
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
        isMicReady: this.isMicReady,
        isAudioActive: this.isAudioActive,
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
