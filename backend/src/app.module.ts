import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { QueueModule } from './core/queue/queue.module.js';
import { RequestQueueInterceptor } from './core/queue/request-queue.interceptor.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ReadingsModule } from './modules/readings/readings.module.js';
import { StagesModule } from './modules/stages/stages.module.js';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    UsersModule,
    AuthModule,
    ReadingsModule,
    StagesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestQueueInterceptor,
    },
  ],
})
export class AppModule {}

