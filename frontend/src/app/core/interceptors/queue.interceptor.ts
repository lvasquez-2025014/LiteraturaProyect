import { HttpInterceptorFn } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * Cola de solicitudes en el Cliente (Angular).
 * Asegura que las peticiones hacia la API no saturen el canal de red del navegador,
 * despachándolas ordenadamente en lotes concurrentes seguros y secuenciando escrituras.
 */
const MAX_CONCURRENT_REQUESTS = 6;
let activeRequests = 0;

interface QueueItem {
  execute: () => Observable<any>;
  subject: Subject<any>;
}

const clientQueue: QueueItem[] = [];

function dispatchNext(): void {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || clientQueue.length === 0) {
    return;
  }

  const item = clientQueue.shift();
  if (!item) return;

  activeRequests++;

  item.execute()
    .pipe(
      finalize(() => {
        activeRequests--;
        dispatchNext();
      })
    )
    .subscribe({
      next: (val) => item.subject.next(val),
      error: (err) => item.subject.error(err),
      complete: () => item.subject.complete(),
    });
}

export const queueInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo encolar peticiones que van hacia la API interna
  const isApiRequest = req.url.includes('/api');
  if (!isApiRequest) {
    return next(req);
  }

  return new Observable((observer) => {
    const subject = new Subject<any>();
    const subscription = subject.subscribe(observer);

    clientQueue.push({
      execute: () => next(req),
      subject,
    });

    dispatchNext();

    return () => {
      subscription.unsubscribe();
    };
  });
};
