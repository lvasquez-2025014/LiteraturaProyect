import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

interface QueuedItem<T = any> {
  execute: () => Observable<T>;
  resolve: (obs: Observable<T>) => void;
  reject: (err: any) => void;
  timeoutId: NodeJS.Timeout;
  enqueuedAt: number;
}

@Injectable()
export class RequestQueueService {
  private readonly logger = new Logger('RequestQueue');
  private readonly maxConcurrency: number;
  private readonly maxQueueSize: number;
  private readonly timeoutMs: number;

  private activeCount = 0;
  private queue: QueuedItem[] = [];
  private totalProcessed = 0;

  constructor() {
    // Máximo de peticiones procesadas concurrentemente a la vez (10 por defecto)
    this.maxConcurrency = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10);
    // Capacidad máxima de amortiguación en cola antes de responder con 503
    this.maxQueueSize = parseInt(process.env.MAX_QUEUE_SIZE || '1500', 10);
    // Tiempo límite que una petición puede esperar en cola sin ser atendida
    this.timeoutMs = parseInt(process.env.QUEUE_TIMEOUT_MS || '30000', 10);

    this.logger.log(
      `[RequestQueue] Cola de peticiones activa: concurrencia máxima ${this.maxConcurrency} paralelas, buffer máx ${this.maxQueueSize}`
    );
  }

  enqueue<T>(taskFn: () => Observable<T>): Promise<Observable<T>> {
    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(
        new Error('Servidor con alta demanda: la cola de peticiones está llena. Por favor reintenta en breve.')
      );
    }

    return new Promise<Observable<T>>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const idx = this.queue.findIndex((item) => item.timeoutId === timeoutId);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          reject(new Error('Tiempo límite de espera en cola excedido (Timeout 30s)'));
        }
      }, this.timeoutMs);

      this.queue.push({
        execute: taskFn,
        resolve,
        reject,
        timeoutId,
        enqueuedAt: Date.now(),
      });

      this.dispatchNext();
    });
  }

  private dispatchNext(): void {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    clearTimeout(item.timeoutId);
    this.activeCount++;

    if (this.queue.length > 5) {
      this.logger.warn(
        `[RequestQueue] Alta concurrencia: ${this.activeCount} activas, ${this.queue.length} en espera en cola FIFO.`
      );
    }

    const wrapped$ = new Observable((subscriber) => {
      const sub = item.execute().subscribe({
        next: (val) => subscriber.next(val),
        error: (err) => {
          this.activeCount--;
          this.totalProcessed++;
          this.dispatchNext();
          subscriber.error(err);
        },
        complete: () => {
          this.activeCount--;
          this.totalProcessed++;
          this.dispatchNext();
          subscriber.complete();
        },
      });

      return () => sub.unsubscribe();
    });

    item.resolve(wrapped$);
  }

  getMetrics() {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      maxConcurrency: this.maxConcurrency,
      totalProcessed: this.totalProcessed,
    };
  }
}
