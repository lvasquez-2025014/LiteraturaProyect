import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading, ReadingAttemptResult } from '../../../../core/models/reading.model';
import { SpeechRecognitionService } from '../../../../core/services/speech-recognition.service';
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

  private speechService = inject(SpeechRecognitionService);
  private cdr = inject(ChangeDetectorRef);

  words: string[] = [];
  totalWords: number = 0;

  isRecording = false;
  isPaused = false;
  currentWordIndex = 0;
  secondsElapsed = 0;
  currentWpm = 0;
  transcript = '';
  micError: string | null = null;
  mode: 'mic' | 'assisted' = 'mic';

  // Quiz & Victory state
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

    this.speechService.onWordsUpdated = (spokenWords, wpm) => {
      this.currentWpm = wpm;

      // Smart word matching: advance highlight
      if (spokenWords.length > 0) {
        const lastSpoken = spokenWords[spokenWords.length - 1].toLowerCase().replace(/[.,;:?!]/g, '');
        const lookAheadRange = 6;
        for (let i = this.currentWordIndex; i < Math.min(this.words.length, this.currentWordIndex + lookAheadRange); i++) {
          const targetWord = this.words[i].toLowerCase().replace(/[.,;:?!]/g, '');
          if (targetWord.length >= 3 && lastSpoken.includes(targetWord)) {
            this.currentWordIndex = i + 1;
            break;
          }
        }
      }

      if (this.currentWordIndex >= this.totalWords && !this.showQuiz && !this.showVictory) {
        this.finishReading();
      }

      this.cdr.detectChanges();
    };
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.speechService.stop();
  }

  startReading(): void {
    this.micError = null;
    this.currentWordIndex = 0;
    this.secondsElapsed = 0;
    this.currentWpm = 0;
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
    this.currentWordIndex = 0;
    this.secondsElapsed = 0;
    this.currentWpm = 0;
    this.isRecording = false;
    this.isPaused = false;
    this.micError = null;
  }

  finishReading(): void {
    this.stopTimer();
    this.speechService.stop();
    this.isRecording = false;

    // Minimum 10 seconds for meaningful WPM
    const activeSeconds = Math.max(8, this.secondsElapsed);
    const calculatedWpm = Math.round((this.totalWords / activeSeconds) * 60);
    this.currentWpm = calculatedWpm;

    // Open comprehension quiz
    this.showQuiz = true;
    this.currentQuestionIndex = 0;
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (this.totalWords === 0) return 0;
    return Math.min(100, Math.round((this.currentWordIndex / this.totalWords) * 100));
  }

  // Quiz Handling
  selectQuizOption(optionIndex: number): void {
    if (this.showExplanation) return;
    this.selectedAnswers[this.currentQuestionIndex] = optionIndex;
    this.showExplanation = true;
  }

  nextQuestion(): void {
    this.showExplanation = false;
    if (this.currentQuestionIndex < this.reading.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.evaluateQuiz();
    }
  }

  evaluateQuiz(): void {
    let correctCount = 0;
    this.reading.questions.forEach((q, idx) => {
      if (this.selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / this.reading.questions.length) * 100);
    this.quizScore = scorePercentage;

    // Bonus XP based on WPM and quiz accuracy
    const speedBonus = this.currentWpm >= this.reading.targetWpm ? 30 : 0;
    const comprehensionBonus = Math.round((this.reading.xpReward * scorePercentage) / 100);
    const totalXp = this.reading.xpReward + speedBonus + comprehensionBonus;

    this.finalResult = {
      readingId: this.reading.id,
      studentId: this.studentId,
      wpm: this.currentWpm,
      accuracy: Math.min(100, Math.round((this.currentWordIndex / this.totalWords) * 100)),
      timeSeconds: this.secondsElapsed,
      comprehensionScore: scorePercentage,
      xpEarned: totalXp,
      date: new Date().toISOString(),
    };

    this.showQuiz = false;
    this.showVictory = true;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#004AAD', '#F36F21', '#FFD700', '#00C49F'],
      });
    } catch {
      // Confetti fallback
    }

    // Emit result
    this.completeAttempt.emit(this.finalResult);
  }

  onVictoryContinue(): void {
    this.back.emit();
  }
}
