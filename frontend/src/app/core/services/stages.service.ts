import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { RoadmapStage, ROADMAP_STAGES } from '../models/reading.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StagesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/stages`;

  // Reactive signal of all active stages
  stagesSignal = signal<RoadmapStage[]>([...ROADMAP_STAGES]);

  getStages(): Observable<RoadmapStage[]> {
    return this.http.get<RoadmapStage[]>(this.API_URL).pipe(
      map((list) => {
        if (list && list.length > 0) {
          const normalized: RoadmapStage[] = list.map((s: any) => ({
            ...s,
            id: Number(s.id) || Number(s.stageNumber) || 1,
            stageNumber: Number(s.stageNumber) || Number(s.id) || 1,
            startLevel: Number(s.startLevel) || 1,
            endLevel: Number(s.endLevel) || 1,
            totalLevels: Number(s.totalLevels) || (Number(s.endLevel) - Number(s.startLevel) + 1),
            rewardXp: Number(s.rewardXp) || 250,
            rewardCoins: Number(s.rewardCoins) || 100,
            _id: s._id || s.id?.toString(),
          }));
          normalized.sort((a, b) => a.startLevel - b.startLevel);
          this.stagesSignal.set(normalized);
          return normalized;
        }
        return this.stagesSignal();
      }),
      catchError((err) => {
        console.warn('[StagesService] Usando etapas locales de respaldo:', err);
        return of(this.stagesSignal());
      }),
    );
  }

  createStage(stage: Partial<RoadmapStage>): Observable<RoadmapStage> {
    return this.http.post<RoadmapStage>(this.API_URL, stage).pipe(
      tap((created: any) => {
        const item: RoadmapStage = {
          ...created,
          id: Number(created.id) || Number(created.stageNumber) || this.stagesSignal().length + 1,
          stageNumber: Number(created.stageNumber) || Number(created.id) || this.stagesSignal().length + 1,
          _id: created._id || created.id?.toString(),
        };
        this.stagesSignal.update((current) => {
          const next = [...current, item];
          return next.sort((a, b) => a.startLevel - b.startLevel);
        });
      }),
    );
  }

  updateStage(id: number | string, stage: Partial<RoadmapStage>): Observable<RoadmapStage> {
    return this.http.put<RoadmapStage>(`${this.API_URL}/${id}`, stage).pipe(
      tap((updated: any) => {
        const item: RoadmapStage = {
          ...updated,
          id: Number(updated.id) || Number(updated.stageNumber) || Number(id),
          stageNumber: Number(updated.stageNumber) || Number(updated.id) || Number(id),
          _id: updated._id || updated.id?.toString(),
        };
        this.stagesSignal.update((current) =>
          current
            .map((s) => (s._id === id || s.id === Number(id) || s._id === item._id ? item : s))
            .sort((a, b) => a.startLevel - b.startLevel),
        );
      }),
    );
  }

  deleteStage(id: number | string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.stagesSignal.update((current) =>
          current.filter((s) => s._id !== id && s.id !== Number(id)),
        );
      }),
    );
  }
}
