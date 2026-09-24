import { Module, Global } from '@nestjs/common';
import { RequestQueueService } from './request-queue.service.js';
import { RequestQueueInterceptor } from './request-queue.interceptor.js';

@Global()
@Module({
  providers: [RequestQueueService, RequestQueueInterceptor],
  exports: [RequestQueueService, RequestQueueInterceptor],
})
export class QueueModule {}
