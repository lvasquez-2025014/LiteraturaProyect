import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module.js';
import { QueueModule } from './core/queue/queue.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ReadingsModule } from './modules/readings/readings.module.js';
import { StagesModule } from './modules/stages/stages.module.js';
import { ClassroomActivitiesModule } from './modules/classroom-activities/classroom-activities.module.js';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    UsersModule,
    AuthModule,
    ReadingsModule,
    StagesModule,
    ClassroomActivitiesModule,
  ],
})
export class AppModule {}

