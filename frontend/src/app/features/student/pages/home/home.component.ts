import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ReadingRoadmapComponent } from '../../components/reading-roadmap/reading-roadmap.component';
import { ReadingReaderComponent } from '../../components/reading-reader/reading-reader.component';
import { KINAL_READINGS } from '../../../../core/data/kinal-readings';
import { Reading, ReadingAttemptResult } from '../../../../core/models/reading.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReadingRoadmapComponent, ReadingReaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class StudentHomeComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  readings: Reading[] = [...KINAL_READINGS];
  activeReading: Reading | null = null;

  get user() {
    return this.auth.currentUserSignal();
  }

  get stats() {
    return this.user?.stats || {
      totalXp: 0,
      currentLevel: 1,
      averageWpm: 0,
      comprehensionRate: 0,
      streakDays: 0,
      completedReadings: 0,
    };
  }

  ngOnInit(): void {
    this.syncReadingsWithLevel();
  }

  private syncReadingsWithLevel(): void {
    const userLevel = this.stats.currentLevel || 1;
    this.readings = this.readings.map((r) => ({
      ...r,
      unlocked: r.level <= userLevel,
      completed: r.level < userLevel,
    }));
  }

  onStartNextReading(): void {
    const nextReading = this.readings.find((r) => r.level === this.stats.currentLevel) || this.readings[0];
    this.activeReading = nextReading;
  }

  onSelectReading(reading: Reading): void {
    this.activeReading = reading;
  }

  onAttemptCompleted(result: ReadingAttemptResult): void {
    // 1. Update reading state locally
    this.readings = this.readings.map((r) => {
      if (r.id === result.readingId) {
        return {
          ...r,
          completed: true,
          bestWpm: Math.max(r.bestWpm || 0, result.wpm),
          bestComprehension: Math.max(r.bestComprehension || 0, result.comprehensionScore),
        };
      }
      return r;
    });

    // 2. Persist in MongoDB via backend API
    const studentId = this.user?.id;
    if (studentId) {
      this.http.post<any>(`${environment.apiUrl}/users/${studentId}/reading-attempt`, {
        wpm: result.wpm,
        comprehensionScore: result.comprehensionScore,
        xpEarned: result.xpEarned,
        readingLevel: this.activeReading?.level || 1,
      }).subscribe({
        next: (updatedUser) => {
          if (updatedUser && this.auth.currentUserSignal()) {
            const currentUser = this.auth.currentUserSignal()!;
            const updated = {
              ...currentUser,
              stats: updatedUser.stats,
            };
            this.auth.saveSession({ token: this.auth.getToken() || '', user: updated });
            this.syncReadingsWithLevel();
          }
        },
        error: (err) => {
          console.warn('Error guardando intento de lectura en backend:', err);
        },
      });
    }
  }
}
