import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentPerformance } from '../../../../core/models/reading.model';

@Component({
  selector: 'app-student-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-detail-modal.component.html',
  styleUrl: './student-detail-modal.component.css',
})
export class StudentDetailModalComponent {
  @Input({ required: true }) performance!: StudentPerformance;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  getBarHeight(wpm: number): number {
    return Math.min(100, Math.max(15, Math.round((wpm / 220) * 100)));
  }
}
