import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassroomActivity, ClassroomActivitySubmission } from '../models/classroom-activity.model';

@Injectable({
  providedIn: 'root',
})
export class ClassroomActivitiesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/classroom-activities`;

  getActive(): Observable<ClassroomActivity | null> {
    return this.http.get<ClassroomActivity | null>(`${this.apiUrl}/active`).pipe(
      catchError((err) => {
        console.warn('[ClassroomActivitiesService] Error al obtener actividad activa:', err);
        return of(null);
      })
    );
  }

  getAll(): Observable<ClassroomActivity[]> {
    return this.http.get<ClassroomActivity[]>(this.apiUrl);
  }

  getById(id: string): Observable<ClassroomActivity> {
    return this.http.get<ClassroomActivity>(`${this.apiUrl}/${id}`);
  }

  getRanking(id: string): Observable<ClassroomActivitySubmission[]> {
    return this.http.get<ClassroomActivitySubmission[]>(`${this.apiUrl}/${id}/ranking`);
  }

  create(data: Partial<ClassroomActivity>): Observable<ClassroomActivity> {
    return this.http.post<ClassroomActivity>(this.apiUrl, data);
  }

  updateStatus(id: string, status: 'ACTIVE' | 'FINISHED' | 'DRAFT'): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/${id}/status`, { status });
  }

  submitAttempt(
    activityId: string,
    submission: {
      score: number;
      wpm: number;
      timeSpentSeconds: number;
      correctAnswersCount: number;
      totalQuestions: number;
      micUsed: boolean;
      infractionsCount: number;
    }
  ): Observable<{ submission: ClassroomActivitySubmission; rank: number; totalStudents: number }> {
    return this.http.post<{ submission: ClassroomActivitySubmission; rank: number; totalStudents: number }>(
      `${this.apiUrl}/${activityId}/submit`,
      submission
    );
  }
}
