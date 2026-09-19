import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Reading } from '../models/reading.model';
import { KINAL_READINGS } from '../data/kinal-readings';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReadingsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/readings`;

  // Reactive signal of all active readings
  readingsSignal = signal<Reading[]>([...KINAL_READINGS]);

  getReadings(): Observable<Reading[]> {
    return this.http.get<Reading[]>(this.API_URL).pipe(
      tap((list) => {
        if (list && list.length > 0) {
          const normalized = list.map((r: any) => ({
            ...r,
            id: r.id || r._id,
          }));
          this.readingsSignal.set(normalized);
        }
      }),
      catchError((err) => {
        console.warn('[ReadingsService] Usando lecturas locales predeterminadas:', err);
        return of(this.readingsSignal());
      }),
    );
  }

  createReading(reading: Partial<Reading>): Observable<Reading> {
    return this.http.post<Reading>(this.API_URL, reading).pipe(
      tap((created: any) => {
        const item: Reading = {
          ...created,
          id: created.id || created._id,
        };
        this.readingsSignal.update((current) => [...current, item]);
      }),
    );
  }

  updateReading(id: string, reading: Partial<Reading>): Observable<Reading> {
    return this.http.put<Reading>(`${this.API_URL}/${id}`, reading).pipe(
      tap((updated: any) => {
        const item: Reading = {
          ...updated,
          id: updated.id || updated._id,
        };
        this.readingsSignal.update((current) =>
          current.map((r) => (r.id === id ? item : r)),
        );
      }),
    );
  }

  deleteReading(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.readingsSignal.update((current) => current.filter((r) => r.id !== id));
      }),
    );
  }
}
