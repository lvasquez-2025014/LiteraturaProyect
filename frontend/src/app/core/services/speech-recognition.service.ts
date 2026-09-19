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

  public onStateChange?: (state: SpeechRecognitionState) => void;
  public onWordsUpdated?: (words: string[], wpm: number) => void;

  constructor() {
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
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcriptPiece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                this.fullTranscript += ' ' + transcriptPiece;
              } else {
                currentInterim += transcriptPiece;
              }
            }
            this.interimTranscript = currentInterim;
            this.emitUpdate();
          });
        };

        this.recognition.onerror = (event: any) => {
          this.ngZone.run(() => {
            console.warn('SpeechRecognition error:', event.error);
            this.emitUpdate(event.error === 'not-allowed' ? 'Permiso de micrófono denegado' : event.error);
          });
        };

        this.recognition.onend = () => {
          this.ngZone.run(() => {
            // Auto restart if still listening and not paused
            if (this.isListening && !this.isPaused) {
              try {
                this.recognition.start();
              } catch (err) {
                // already running
              }
            }
          });
        };
      } catch (err) {
        console.warn('Speech recognition not initialized:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public start(): boolean {
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
        console.warn('SpeechRecognition start failed, will support simulated reading:', err);
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
    this.isListening = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;

    let wordIdx = 0;
    const msPerWord = Math.max(180, Math.floor((60 / targetWpm) * 1000));

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

  private calculateWpm(): number {
    if (!this.startTime) return 0;
    const now = this.pauseTimestamp || Date.now();
    const activeSeconds = Math.max(1, (now - this.startTime - this.pausedDuration) / 1000);
    const words = (this.fullTranscript + ' ' + this.interimTranscript)
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const count = words.length;
    return Math.round((count / activeSeconds) * 60);
  }

  private emitUpdate(errorMessage: string | null = null): void {
    const combined = (this.fullTranscript + ' ' + this.interimTranscript).trim();
    const words = combined ? combined.split(/\s+/).filter(Boolean) : [];
    const currentWpm = this.calculateWpm();

    if (this.onWordsUpdated) {
      this.onWordsUpdated(words, currentWpm);
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
