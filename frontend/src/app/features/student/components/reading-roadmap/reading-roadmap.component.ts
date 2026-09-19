import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading } from '../../../../core/models/reading.model';

@Component({
  selector: 'app-reading-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reading-roadmap.component.html',
  styleUrl: './reading-roadmap.component.css',
})
export class ReadingRoadmapComponent {
  @Input() readings: Reading[] = [];
  @Input() currentLevel: number = 1;
  @Output() selectReading = new EventEmitter<Reading>();

  get sortedReadings(): Reading[] {
    return [...this.readings].sort((a, b) => a.level - b.level);
  }

  isCompleted(reading: Reading): boolean {
    return !!reading.completed || reading.level < this.currentLevel;
  }

  isCurrent(reading: Reading): boolean {
    return reading.level === this.currentLevel;
  }

  isLocked(reading: Reading): boolean {
    return !this.isCompleted(reading) && !this.isCurrent(reading);
  }

  getAlignmentClass(index: number): string {
    const alignments = ['align-left', 'align-center', 'align-right', 'align-center'];
    return alignments[index % alignments.length];
  }

  onNodeClick(reading: Reading): void {
    if (!this.isLocked(reading)) {
      this.selectReading.emit(reading);
    }
  }
}
