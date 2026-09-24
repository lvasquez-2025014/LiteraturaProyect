import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, from, switchMap, catchError } from 'rxjs';
import { RequestQueueService } from './request-queue.service.js';

@Injectable()
export class RequestQueueInterceptor implements NestInterceptor {
  constructor(private readonly queueService: RequestQueueService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return from(this.queueService.enqueue(() => next.handle())).pipe(
      switchMap((stream$) => stream$),
      catchError((err) => {
        if (err.message && err.message.includes('cola de peticiones está llena')) {
          throw new ServiceUnavailableException(err.message);
        }
        if (err.message && err.message.includes('Tiempo límite de espera en cola')) {
          throw new RequestTimeoutException(err.message);
        }
        throw err;
      })
    );
  }
}
