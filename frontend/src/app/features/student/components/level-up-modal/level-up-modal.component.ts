import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-level-up-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-up-modal.component.html',
  styleUrl: './level-up-modal.component.css',
})
export class LevelUpModalComponent implements OnInit {
  @Input({ required: true }) newLevel!: number;
  @Input() xpGained: number = 0;
  @Input() coinsGained: number = 0;
  @Input() newAchievements: string[] = [];
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    this.launchConfetti();
  }

  launchConfetti(): void {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#004AAD', '#F36F21', '#FFD700', '#10B981'],
      });
    } catch (e) {}
  }
}
