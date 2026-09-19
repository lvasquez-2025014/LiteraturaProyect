import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService } from '../../../../core/services/gamification.service';
import { Achievement } from '../../../../core/models/gamification.model';

@Component({
  selector: 'app-achievements-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements-view.component.html',
  styleUrl: './achievements-view.component.css',
})
export class AchievementsViewComponent {
  gamification = inject(GamificationService);

  activeCategory = signal<'all' | 'fluidez' | 'comprension' | 'constancia' | 'especial'>('all');

  get allAchievements() {
    return this.gamification.computedAchievements();
  }

  filteredAchievements = computed(() => {
    const cat = this.activeCategory();
    const list = this.allAchievements;
    if (cat === 'all') return list;
    return list.filter((a) => a.category === cat);
  });

  unlockedCount = computed(() => {
    return this.allAchievements.filter((a) => a.unlocked).length;
  });

  progressPercentage = computed(() => {
    return Math.round((this.unlockedCount() / this.allAchievements.length) * 100);
  });

  setCategory(cat: 'all' | 'fluidez' | 'comprension' | 'constancia' | 'especial'): void {
    this.activeCategory.set(cat);
  }
}
