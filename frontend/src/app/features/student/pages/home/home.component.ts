import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { GamificationService } from '../../../../core/services/gamification.service';
import { ReadingsService } from '../../../../core/services/readings.service';
import { ReadingRoadmapComponent } from '../../components/reading-roadmap/reading-roadmap.component';
import { ReadingReaderComponent } from '../../components/reading-reader/reading-reader.component';
import { RewardsCenterComponent } from '../../components/rewards-center/rewards-center.component';
import { AchievementsViewComponent } from '../../components/achievements-view/achievements-view.component';
import { LeaderboardViewComponent } from '../../components/leaderboard-view/leaderboard-view.component';
import { LevelUpModalComponent } from '../../components/level-up-modal/level-up-modal.component';
import { KINAL_READINGS } from '../../../../core/data/kinal-readings';
import { Reading, ReadingAttemptResult } from '../../../../core/models/reading.model';
import { KINAL_GRADE_GROUPS, KINAL_SECTIONS } from '../../../../core/models/user.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    ReadingRoadmapComponent,
    ReadingReaderComponent,
    RewardsCenterComponent,
    AchievementsViewComponent,
    LeaderboardViewComponent,
    LevelUpModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class StudentHomeComponent implements OnInit {
  auth = inject(AuthService);
  gamification = inject(GamificationService);
  private readingsService = inject(ReadingsService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  readings: Reading[] = [...KINAL_READINGS];
  activeReading: Reading | null = null;
  activeTab = signal<'roadmap' | 'rewards' | 'achievements' | 'leaderboard'>('roadmap');
  levelUpModalData = signal<{ level: number; xp: number; coins: number } | null>(null);

  // Academic Onboarding check for Google registered students
  get needsAcademicOnboarding(): boolean {
    const u = this.user;
    return !!u && u.role === 'STUDENT_ROLE' && (!u.grade || !u.section);
  }

  onboardingGrade = '';
  onboardingSection = '';
  onboardingLoading = false;
  onboardingError = '';

  readonly gradeGroups = KINAL_GRADE_GROUPS;
  readonly sections = KINAL_SECTIONS;

  submitAcademicOnboarding() {
    if (!this.onboardingGrade) {
      this.onboardingError = 'Por favor, selecciona tu grado o carrera técnica.';
      return;
    }
    if (!this.onboardingSection) {
      this.onboardingError = 'Por favor, selecciona tu sección correspondiente (A a la J).';
      return;
    }
    const userId = this.user?.id;
    if (!userId) return;

    this.onboardingLoading = true;
    this.onboardingError = '';

    this.auth.updateAcademicProfile(userId, this.onboardingGrade, this.onboardingSection).subscribe({
      next: () => {
        this.onboardingLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.onboardingLoading = false;
        this.onboardingError = err.error?.message || 'Error al guardar tu grado y sección. Intenta nuevamente.';
        this.cdr.markForCheck();
      },
    });
  }

  get user() {
    return this.auth.currentUserSignal();
  }

  get stats() {
    const rawStats = this.user?.stats || {
      totalXp: 0,
      currentLevel: 1,
      averageWpm: 0,
      comprehensionRate: 0,
      streakDays: 0,
      completedReadings: 0,
    };
    if (this.auth.isAdmin()) {
      const totalCount = this.readings.length || 38;
      return {
        ...rawStats,
        totalXp: Math.max(rawStats.totalXp || 0, 10000),
        currentLevel: totalCount,
        completedReadings: totalCount,
        comprehensionRate: 100,
        averageWpm: Math.max(rawStats.averageWpm || 0, 160),
        streakDays: Math.max(rawStats.streakDays || 0, 30),
      };
    }
    return rawStats;
  }

  ngOnInit(): void {
    this.syncReadingsWithLevel();
    this.readingsService.getReadings().subscribe({
      next: (dbReadings) => {
        if (dbReadings && dbReadings.length > 0) {
          this.readings = dbReadings;
        }
        this.syncReadingsWithLevel();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Usando lecturas locales de respaldo:', err);
        this.syncReadingsWithLevel();
        this.cdr.markForCheck();
      },
    });
  }

  private syncReadingsWithLevel(): void {
    const isAdmin = this.auth.isAdmin();
    const userLevel = this.stats.currentLevel || 1;
    this.readings = this.readings.map((r) => ({
      ...r,
      unlocked: isAdmin ? true : r.level <= userLevel,
      completed: isAdmin ? true : r.level < userLevel,
      bestWpm: isAdmin ? Math.max(r.bestWpm || 0, r.targetWpm || 140) : r.bestWpm,
      bestComprehension: isAdmin ? 100 : r.bestComprehension,
    }));
  }

  onStartNextReading(): void {
    if (this.auth.isAdmin()) {
      this.activeReading = this.readings[0];
      return;
    }
    const nextReading = this.readings.find((r) => r.level === this.stats.currentLevel) || this.readings[0];
    this.activeReading = nextReading;
  }

  onSelectReading(reading: Reading): void {
    this.activeReading = reading;
  }

  setTab(tab: 'roadmap' | 'rewards' | 'achievements' | 'leaderboard'): void {
    this.activeTab.set(tab);
  }

  onAttemptCompleted(result: ReadingAttemptResult): void {
    const prevLevel = this.stats.currentLevel || 1;
    const readingLevel = this.activeReading?.level || 1;

    // Cierra la vista del lector y regresa inmediatamente al mapa de aventura
    this.activeReading = null;
    this.cdr.markForCheck();

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
        oralAccuracy: result.accuracy,
        comprehensionScore: result.comprehensionScore,
        xpEarned: result.xpEarned,
        readingLevel: readingLevel,
        readingTitle: result.readingTitle || `Lectura Nivel ${readingLevel}`,
        readingId: result.readingId,
      }).subscribe({
        next: (updatedUser) => {
          if (updatedUser && this.auth.currentUserSignal()) {
            const currentUser = this.auth.currentUserSignal()!;
            const updated = {
              ...currentUser,
              ...updatedUser,
              stats: updatedUser.stats || currentUser.stats,
            };
            this.auth.saveSession({ token: this.auth.getToken() || '', user: updated });
            this.syncReadingsWithLevel();
            this.cdr.markForCheck();

            const newLevel = updated.stats?.currentLevel || 1;
            if (newLevel > prevLevel) {
              this.levelUpModalData.set({
                level: newLevel,
                xp: result.xpEarned,
                coins: 35,
              });
              this.gamification.playChestSound();
            }
          }
        },
        error: (err) => {
          console.warn('Error guardando intento de lectura en backend:', err);
        },
      });
    }
  }
}
