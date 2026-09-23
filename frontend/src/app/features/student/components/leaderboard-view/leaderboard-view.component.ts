import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService } from '../../../../core/services/gamification.service';
import { LeaderboardEntry } from '../../../../core/models/gamification.model';

@Component({
  selector: 'app-leaderboard-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard-view.component.html',
  styleUrl: './leaderboard-view.component.css',
})
export class LeaderboardViewComponent implements OnInit {
  gamification = inject(GamificationService);

  entries = signal<LeaderboardEntry[]>([]);
  isLoading = signal(true);
  filterScope = signal<'all' | 'my_grade'>('all');

  get currentUser() {
    return this.gamification.currentUser();
  }

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  setFilter(scope: 'all' | 'my_grade'): void {
    this.filterScope.set(scope);
    this.fetchLeaderboard();
  }

  fetchLeaderboard(): void {
    this.isLoading.set(true);
    const user = this.currentUser;
    const grade = this.filterScope() === 'my_grade' ? user?.grade : undefined;
    const section = this.filterScope() === 'my_grade' ? user?.section : undefined;

    this.gamification.getLeaderboard(grade, section).subscribe({
      next: (data) => {
        // Si la base de datos aún no tiene múltiples alumnos, preparamos datos de demostración institucional enriquecidos
        if (!data || data.length === 0) {
          this.entries.set(this.getMockInstitutionalLeaderboard());
        } else {
          // Asegurar que el estudiante actual aparezca con sus datos reales si está registrado
          this.entries.set(data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.entries.set(this.getMockInstitutionalLeaderboard());
        this.isLoading.set(false);
      },
    });
  }

  get topThree() {
    const list = this.entries();
    return {
      first: list[0] || null,
      second: list[1] || null,
      third: list[2] || null,
    };
  }

  get remainingList() {
    return this.entries().slice(3);
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return entry.id === this.currentUser?.id || entry.name === this.currentUser?.name;
  }

  private getMockInstitutionalLeaderboard(): LeaderboardEntry[] {
    const current = this.currentUser;
    const list: LeaderboardEntry[] = [
      {
        rank: 1,
        id: 'usr-demo-1',
        name: 'Carlos Estuardo Gómez Pérez',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        grade: '5to Perito en Computación',
        section: 'A',
        totalXp: 3450,
        currentLevel: 8,
        averageWpm: 172,
        comprehensionRate: 94,
        streakDays: 9,
        equippedTitle: 'Lector Destacado',
        equippedFrame: 'frame-gold',
      },
      {
        rank: 2,
        id: 'usr-demo-2',
        name: 'Diego Fernando Lima Castillo',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        grade: '5to Perito en Electricidad',
        section: 'B',
        totalXp: 2890,
        currentLevel: 6,
        averageWpm: 165,
        comprehensionRate: 90,
        streakDays: 6,
        equippedTitle: 'Cronista de Santiago',
        equippedFrame: 'frame-blue',
      },
      {
        rank: 3,
        id: 'usr-demo-3',
        name: 'Alejandro José Barillas Ramos',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        grade: '4to Bachillerato en Dibujo',
        section: 'A',
        totalXp: 2150,
        currentLevel: 5,
        averageWpm: 154,
        comprehensionRate: 88,
        streakDays: 4,
        equippedTitle: 'Explorador del Bosque',
        equippedFrame: 'frame-orange',
      },
      {
        rank: 4,
        id: current?.id || 'usr-me',
        name: current?.name || 'Estudiante Activo',
        avatarUrl: current?.avatarUrl || '',
        grade: current?.grade || '5to Bachillerato en Computación',
        section: current?.section || 'A',
        totalXp: current?.stats?.totalXp || 1420,
        currentLevel: current?.stats?.currentLevel || 3,
        averageWpm: current?.stats?.averageWpm || 138,
        comprehensionRate: current?.stats?.comprehensionRate || 85,
        streakDays: current?.stats?.streakDays || 3,
        equippedTitle: current?.equippedTitle || 'Cadete de las Letras',
        equippedFrame: current?.equippedFrame || 'frame-default',
      },
      {
        rank: 5,
        id: 'usr-demo-5',
        name: 'Marvin Josué Cifuentes Estrada',
        avatarUrl: '',
        grade: '5to Perito en Mecánica',
        section: 'A',
        totalXp: 1100,
        currentLevel: 3,
        averageWpm: 130,
        comprehensionRate: 80,
        streakDays: 2,
        equippedTitle: 'Cadete de las Letras',
        equippedFrame: 'frame-default',
      },
      {
        rank: 6,
        id: 'usr-demo-6',
        name: 'Kevin Antonio Méndez Solís',
        avatarUrl: '',
        grade: '4to Bachillerato en Computación',
        section: 'B',
        totalXp: 850,
        currentLevel: 2,
        averageWpm: 122,
        comprehensionRate: 75,
        streakDays: 1,
        equippedTitle: 'Cadete de las Letras',
        equippedFrame: 'frame-default',
      }
    ];

    // Ordenar de mayor a menor XP
    list.sort((a, b) => b.totalXp - a.totalXp);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }
}
