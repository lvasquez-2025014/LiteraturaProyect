import { Module } from '@nestjs/common';
import { ClassroomActivitiesController } from './classroom-activities.controller.js';
import { ClassroomActivitiesService } from './services/classroom-activities.service.js';

@Module({
  controllers: [ClassroomActivitiesController],
  providers: [ClassroomActivitiesService],
  exports: [ClassroomActivitiesService],
})
export class ClassroomActivitiesModule {}
