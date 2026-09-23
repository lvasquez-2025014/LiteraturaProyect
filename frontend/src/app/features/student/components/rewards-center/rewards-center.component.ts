import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService } from '../../../../core/services/gamification.service';
import { DailyMission, CosmeticItem } from '../../../../core/models/gamification.model';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-rewards-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rewards-center.component.html',
  styleUrl: './rewards-center.component.css',
})
export class RewardsCenterComponent {
  gamification = inject(GamificationService);

  isOpeningChest = signal(false);
  chestRevealedReward = signal<{ xp: number; coins: number } | null>(null);
  activeShopTab = signal<'frames' | 'titles'>('frames');
  actionMessage = signal<string | null>(null);

  get user() {
    return this.gamification.currentUser();
  }

  get coins() {
    return this.gamification.coins();
  }

  get equippedFrame() {
    return this.gamification.equippedFrame();
  }

  get equippedTitle() {
    return this.gamification.equippedTitle();
  }

  get canClaimDailyChest() {
    return this.gamification.canClaimDailyChest();
  }

  get missions() {
    return this.gamification.dailyMissions();
  }

  get cosmetics() {
    return this.gamification.cosmeticsList();
  }

  get frameItems() {
    return this.cosmetics.filter((c) => c.type === 'frame');
  }

  get titleItems() {
    return this.cosmetics.filter((c) => c.type === 'title');
  }

  /* ==========================================================
   * ABRIR COFRE DIARIO
   * ========================================================== */
  openDailyChest(): void {
    if (!this.canClaimDailyChest || this.isOpeningChest()) return;

    this.isOpeningChest.set(true);

    this.gamification.claimChest().subscribe({
      next: (res) => {
        // Disparar confeti
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#004AAD', '#F36F21', '#FFD700', '#10B981'],
          });
        } catch (e) {}

        this.chestRevealedReward.set({
          xp: res.xpWon || 65,
          coins: res.coinsWon || 30,
        });

        setTimeout(() => {
          this.isOpeningChest.set(false);
        }, 800);
      },
      error: (err) => {
        this.isOpeningChest.set(false);
        this.showMessage(err.error?.message || 'No se pudo abrir el cofre');
      },
    });
  }

  closeChestRewardModal(): void {
    this.chestRevealedReward.set(null);
  }

  /* ==========================================================
   * RECLAMAR MISIÓN DIARIA
   * ========================================================== */
  claimMission(mission: DailyMission): void {
    if (!mission.completed || mission.claimed) return;

    this.gamification.claimMission(mission).subscribe({
      next: () => {
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#F36F21', '#FFD700', '#004AAD'],
          });
        } catch (e) {}
        this.showMessage(`¡Misión reclamada! +${mission.rewardXp} XP y +${mission.rewardCoins} Monedas`);
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al reclamar misión');
      },
    });
  }

  /* ==========================================================
   * TIENDA DE PERSONALIZACIÓN
   * ========================================================== */
  equipOrBuy(item: CosmeticItem): void {
    const isEquipped =
      item.type === 'frame'
        ? this.equippedFrame === item.id
        : this.equippedTitle === item.id || (item.id === 'title-cadete' && !this.equippedTitle);

    if (isEquipped) {
      this.showMessage(`Ya tienes equipado "${item.name}"`);
      return;
    }

    // Si es gratuito
    if (item.cost === 0) {
      this.gamification.equipCosmetic(item.type, item.name).subscribe({
        next: () => this.showMessage(`¡"${item.name}" equipado con éxito!`),
        error: (err) => this.showMessage(err.error?.message || 'Error al equipar'),
      });
      return;
    }

    // Si tiene costo
    if (this.coins < item.cost) {
      this.showMessage(`Necesitas ${item.cost} Monedas de Sabiduría (tienes ${this.coins})`);
      return;
    }

    this.gamification.buyCosmetic(item).subscribe({
      next: () => {
        this.showMessage(`¡Adquiriste y equipaste "${item.name}"!`);
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error en la adquisición');
      },
    });
  }

  isItemEquipped(item: CosmeticItem): boolean {
    if (item.type === 'frame') {
      return this.equippedFrame === item.id;
    } else {
      return this.equippedTitle === item.name || (item.id === 'title-cadete' && !this.equippedTitle);
    }
  }

  private showMessage(msg: string): void {
    this.actionMessage.set(msg);
    setTimeout(() => {
      this.actionMessage.set(null);
    }, 3500);
  }
}
