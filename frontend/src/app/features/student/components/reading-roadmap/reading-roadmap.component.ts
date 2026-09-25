import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reading, RoadmapStage } from '../../../../core/models/reading.model';
import { AuthService } from '../../../../core/services/auth.service';
import { StagesService } from '../../../../core/services/stages.service';

@Component({
  selector: 'app-reading-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reading-roadmap.component.html',
  styleUrl: './reading-roadmap.component.css',
})
export class ReadingRoadmapComponent implements OnInit, OnChanges {
  @Input() readings: Reading[] = [];
  @Input() currentLevel: number = 1;
  @Output() selectReading = new EventEmitter<Reading>();

  auth = inject(AuthService);
  private stagesService = inject(StagesService);

  selectedStageId = signal<number>(1);
  viewMode = signal<'stage' | 'all'>('stage');
  activePopoverReading = signal<Reading | null>(null);
  showStageGuide = signal<boolean>(false);

  get stages(): RoadmapStage[] {
    return this.stagesService.stagesSignal();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.stagesService.getStages().subscribe(() => {
      this.updateActiveStageFromCurrentLevel();
    });
    this.updateActiveStageFromCurrentLevel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentLevel'] && !changes['currentLevel'].firstChange) {
      this.updateActiveStageFromCurrentLevel();
    }
  }

  private updateActiveStageFromCurrentLevel(): void {
    if (this.isAdmin) {
      this.selectedStageId.set(1);
      return;
    }
    const currentStage = this.stages.find(
      (s) => this.currentLevel >= s.startLevel && this.currentLevel <= s.endLevel
    );
    if (currentStage) {
      this.selectedStageId.set(currentStage.id);
    }
  }

  get activeStage(): RoadmapStage {
    return this.stages.find((s) => s.id === this.selectedStageId()) || this.stages[0];
  }

  get sortedReadings(): Reading[] {
    return [...this.readings].sort((a, b) => a.level - b.level);
  }

  get displayedReadings(): Reading[] {
    if (this.viewMode() === 'all') {
      return this.sortedReadings;
    }
    const stage = this.activeStage;
    return this.sortedReadings.filter((r) => r.level >= stage.startLevel && r.level <= stage.endLevel);
  }

  setStage(stageId: number): void {
    this.selectedStageId.set(stageId);
    this.closePopover();
  }

  prevStage(): void {
    if (this.selectedStageId() > 1) {
      this.selectedStageId.update((id) => id - 1);
      this.closePopover();
    }
  }

  nextStage(): void {
    if (this.selectedStageId() < this.stages.length) {
      this.selectedStageId.update((id) => id + 1);
      this.closePopover();
    }
  }

  setViewMode(mode: 'stage' | 'all'): void {
    this.viewMode.set(mode);
    this.closePopover();
  }

  getStageProgress(stage: RoadmapStage): {
    completed: number;
    total: number;
    percentage: number;
    isUnlocked: boolean;
    isCompleted: boolean;
  } {
    if (this.isAdmin) {
      return {
        completed: stage.totalLevels,
        total: stage.totalLevels,
        percentage: 100,
        isUnlocked: true,
        isCompleted: true,
      };
    }
    const total = stage.totalLevels;
    const stageReadings = this.sortedReadings.filter(
      (r) => r.level >= stage.startLevel && r.level <= stage.endLevel
    );
    const completed = stageReadings.filter((r) => this.isCompleted(r)).length;
    const percentage = Math.round((completed / total) * 100);
    const isUnlocked = stage.id === 1 || this.currentLevel >= stage.startLevel;
    const isCompleted = completed >= total;

    return {
      completed,
      total,
      percentage,
      isUnlocked,
      isCompleted,
    };
  }

  isCompleted(reading: Reading): boolean {
    if (this.isAdmin) return true;
    return !!reading.completed || reading.level < this.currentLevel;
  }

  isCurrent(reading: Reading): boolean {
    if (this.isAdmin) return false;
    return reading.level === this.currentLevel;
  }

  isLocked(reading: Reading): boolean {
    if (this.isAdmin) return false;
    return !this.isCompleted(reading) && !this.isCurrent(reading);
  }

  getNodeXOffset(index: number): number {
    const offsets = [0, -48, 0, 48, 0, -48, 0, 48];
    return offsets[index % offsets.length];
  }

  isChestNode(index: number): boolean {
    return index > 0 && index % 4 === 2;
  }

  isHeadphonesNode(index: number): boolean {
    return index > 0 && index % 4 === 3;
  }

  onNodeClick(reading: Reading): void {
    if (this.isAdmin || !this.isLocked(reading)) {
      this.activePopoverReading.set(reading);
    }
  }

  closePopover(): void {
    this.activePopoverReading.set(null);
  }

  startReading(reading: Reading): void {
    this.closePopover();
    this.selectReading.emit(reading);
  }

  toggleStageGuide(): void {
    this.showStageGuide.update((v) => !v);
  }
}
