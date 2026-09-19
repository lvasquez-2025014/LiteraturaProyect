import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import {
  Achievement,
  League,
  DailyMission,
  CosmeticItem,
  LeaderboardEntry,
  KINAL_ACHIEVEMENTS,
  KINAL_LEAGUES,
  KINAL_COSMETICS,
} from '../models/gamification.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class GamificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Audio Context para efectos de sonido sintetizados
  private audioCtx: AudioContext | null = null;

  // Catálogos base
  readonly achievementsList = signal<Achievement[]>([...KINAL_ACHIEVEMENTS]);
  readonly leaguesList = signal<League[]>([...KINAL_LEAGUES]);
  readonly cosmeticsList = signal<CosmeticItem[]>([...KINAL_COSMETICS]);

  // Usuario actual reactivo
  readonly currentUser = computed(() => this.auth.currentUserSignal());

  // Monedas reactivas
  readonly coins = computed(() => {
    if (this.currentUser()?.role === 'ADMIN_ROLE') {
      return 99999;
    }
    return this.currentUser()?.coins ?? 60;
  });

  // Título y Marco activos
  readonly equippedTitle = computed(() => {
    if (this.currentUser()?.role === 'ADMIN_ROLE') {
      return this.currentUser()?.equippedTitle || 'Ingeniero Humanista Kinal';
    }
    return this.currentUser()?.equippedTitle || 'Cadete de las Letras';
  });

  readonly equippedFrame = computed(() => {
    if (this.currentUser()?.role === 'ADMIN_ROLE') {
      return this.currentUser()?.equippedFrame || 'frame-kinal';
    }
    return this.currentUser()?.equippedFrame || 'frame-default';
  });

  // Liga actual y progreso
  readonly currentLeague = computed(() => {
    if (this.currentUser()?.role === 'ADMIN_ROLE') {
      return this.leaguesList().find((l) => l.id === 'diamante') || this.leaguesList()[this.leaguesList().length - 1];
    }
    const xp = this.currentUser()?.stats?.totalXp || 0;
    return this.getLeagueForXp(xp);
  });

  readonly leagueProgress = computed(() => {
    if (this.currentUser()?.role === 'ADMIN_ROLE') {
      return {
        current: this.currentLeague(),
        next: null,
        percentage: 100,
        xpToNext: 0,
      };
    }

    const xp = this.currentUser()?.stats?.totalXp || 0;
    const current = this.currentLeague();
    const allLeagues = this.leaguesList();
    const currentIndex = allLeagues.findIndex((l) => l.id === current.id);
    const nextLeague = currentIndex < allLeagues.length - 1 ? allLeagues[currentIndex + 1] : null;

    if (!nextLeague) {
      return {
        current,
        next: null,
        percentage: 100,
        xpToNext: 0,
      };
    }

    const range = nextLeague.minXp - current.minXp;
    const gained = Math.max(0, xp - current.minXp);
    const percentage = Math.min(100, Math.round((gained / range) * 100));
    const xpToNext = Math.max(0, nextLeague.minXp - xp);

    return {
      current,
      next: nextLeague,
      percentage,
      xpToNext,
    };
  });

  // Misiones diarias calculadas en base a la sesión de hoy
  readonly dailyMissions = computed<DailyMission[]>(() => {
    const user = this.currentUser();
    const isAdmin = user?.role === 'ADMIN_ROLE';
    const stats = user?.stats;
    const claimed = user?.claimedMissions || [];

    const completedToday = isAdmin ? true : (stats?.completedReadings || 0) > 0;
    const wpmGoal = isAdmin ? true : (stats?.averageWpm || 0) >= 130;
    const compGoal = isAdmin ? true : (stats?.comprehensionRate || 0) >= 80;

    return [
      {
        id: 'mission-daily-read',
        title: 'Lectura Diaria de Entrenamiento',
        description: 'Supera al menos un desafío literario hoy con tu micrófono.',
        icon: 'book',
        target: 1,
        current: 1,
        rewardXp: 40,
        rewardCoins: 15,
        completed: true,
        claimed: isAdmin ? true : claimed.includes('mission-daily-read'),
      },
      {
        id: 'mission-wpm-boost',
        title: 'Impulso de Velocidad Kinal',
        description: 'Mantén un ritmo promedio superior o igual a 130 PPM.',
        icon: 'zap',
        target: 1,
        current: 1,
        rewardXp: 50,
        rewardCoins: 20,
        completed: true,
        claimed: isAdmin ? true : claimed.includes('mission-wpm-boost'),
      },
      {
        id: 'mission-comp-master',
        title: 'Agudeza y Precisión Crítica',
        description: 'Logra al menos 80% de respuestas correctas en comprensión.',
        icon: 'target',
        target: 1,
        current: 1,
        rewardXp: 60,
        rewardCoins: 25,
        completed: true,
        claimed: isAdmin ? true : claimed.includes('mission-comp-master'),
      },
    ];
  });

  // Lista de logros con estado desbloqueado dinámico
  readonly computedAchievements = computed(() => {
    const user = this.currentUser();
    const isAdmin = user?.role === 'ADMIN_ROLE';
    const unlockedIds = new Set(user?.unlockedAchievements || ['ach-welcome']);
    const stats = user?.stats;
    const coins = user?.coins || 0;

    return this.achievementsList().map((ach) => {
      if (isAdmin) {
        return {
          ...ach,
          unlocked: true,
          progress: 100,
        };
      }

      let isUnlocked = unlockedIds.has(ach.id);
      let progress = isUnlocked ? 100 : 0;

      if (!isUnlocked && stats) {
        if (ach.id === 'ach-first-step') {
          progress = stats.completedReadings >= 1 ? 100 : 0;
        } else if (ach.id === 'ach-speed-140') {
          progress = Math.min(100, Math.round((stats.averageWpm / 140) * 100));
        } else if (ach.id === 'ach-speed-170') {
          progress = Math.min(100, Math.round((stats.averageWpm / 170) * 100));
        } else if (ach.id === 'ach-streak-3') {
          progress = Math.min(100, Math.round((stats.streakDays / 3) * 100));
        } else if (ach.id === 'ach-streak-7') {
          progress = Math.min(100, Math.round((stats.streakDays / 7) * 100));
        } else if (ach.id === 'ach-bibliophile') {
          progress = Math.min(100, Math.round((stats.completedReadings / 5) * 100));
        } else if (ach.id === 'ach-kinal-master') {
          progress = Math.min(100, Math.round((stats.currentLevel / 10) * 100));
        } else if (ach.id === 'ach-coins-200') {
          progress = Math.min(100, Math.round((coins / 200) * 100));
        }
        if (progress >= 100) isUnlocked = true;
      }

      return {
        ...ach,
        unlocked: isUnlocked,
        progress,
      };
    });
  });

  // Estado del Cofre Diario
  readonly canClaimDailyChest = computed(() => {
    const user = this.currentUser();
    if (user?.role === 'ADMIN_ROLE') return true;

    if (!user) return false;
    const todayStr = new Date().toISOString().slice(0, 10);
    return user.lastChestClaimDate !== todayStr;
  });

  /* =====================================================================
   * MÉTODOS DE SERVICIO Y APIS
   * ===================================================================== */

  public getLeagueForXp(xp: number): League {
    const leagues = this.leaguesList();
    for (let i = leagues.length - 1; i >= 0; i--) {
      if (xp >= leagues[i].minXp) {
        return leagues[i];
      }
    }
    return leagues[0];
  }

  public getLeaderboard(grade?: string, section?: string): Observable<LeaderboardEntry[]> {
    let params: any = {};
    if (grade) params.grade = grade;
    if (section) params.section = section;
    return this.http.get<LeaderboardEntry[]>(`${environment.apiUrl}/users/leaderboard`, { params });
  }

  public claimChest(): Observable<any> {
    const studentId = this.currentUser()?.id;
    return this.http.post<any>(`${environment.apiUrl}/users/${studentId}/claim-chest`, {}).pipe(
      tap((res) => {
        if (res?.user) {
          this.playChestSound();
          this.updateUserSession(res.user);
        }
      })
    );
  }

  public claimMission(mission: DailyMission): Observable<any> {
    const studentId = this.currentUser()?.id;
    return this.http.post<any>(`${environment.apiUrl}/users/${studentId}/claim-mission`, {
      missionId: mission.id,
      rewardXp: mission.rewardXp,
      rewardCoins: mission.rewardCoins,
    }).pipe(
      tap((res) => {
        if (res?.user) {
          this.playMissionSound();
          this.updateUserSession(res.user);
        }
      })
    );
  }

  public equipCosmetic(type: 'frame' | 'title', id: string): Observable<any> {
    const studentId = this.currentUser()?.id;
    const body: any = {};
    if (type === 'frame') body.equippedFrame = id;
    if (type === 'title') body.equippedTitle = id;

    return this.http.patch<any>(`${environment.apiUrl}/users/${studentId}/cosmetics`, body).pipe(
      tap((updatedUser) => {
        if (updatedUser) {
          this.playEquipSound();
          this.updateUserSession(updatedUser);
        }
      })
    );
  }

  public buyCosmetic(item: CosmeticItem): Observable<any> {
    const studentId = this.currentUser()?.id;
    return this.http.post<any>(`${environment.apiUrl}/users/${studentId}/buy-cosmetic`, {
      itemId: item.id,
      itemType: item.type,
      cost: item.cost,
    }).pipe(
      tap((res) => {
        if (res?.user) {
          this.playPurchaseSound();
          this.updateUserSession(res.user);
        }
      })
    );
  }

  private updateUserSession(updatedUser: User): void {
    const currentUser = this.auth.currentUserSignal();
    if (currentUser) {
      const isAdmin = currentUser.role === 'ADMIN_ROLE' || updatedUser.role === 'ADMIN_ROLE';
      const merged: User = {
        ...currentUser,
        ...updatedUser,
        coins: isAdmin ? 99999 : (updatedUser.coins ?? currentUser.coins),
        stats: updatedUser.stats || currentUser.stats,
      };
      this.auth.saveSession({
        token: this.auth.getToken() || '',
        user: merged,
      });
    }
  }

  /* =====================================================================
   * SONIDOS SINTETIZADOS WEB AUDIO API (Cero dependencias)
   * ===================================================================== */
  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playChestSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Arpegio resplandeciente (C5, G5, C6, E6)
      [523.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.09, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch (e) {}
  }

  public playMissionSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Tono de éxito ágil (F5 -> A5 -> C6)
      [698.46, 880.0, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.07, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch (e) {}
  }

  public playEquipSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  public playPurchaseSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Sonido de monedas tintineando
      [1200, 1600, 2000].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch (e) {}
  }
}
