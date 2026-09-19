import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module.js';
import { ReadingsService } from './services/readings.service.js';
import { ReadingsController } from './readings.controller.js';

@Module({
  imports: [DatabaseModule],
  providers: [ReadingsService],
  controllers: [ReadingsController],
  exports: [ReadingsService],
})
export class ReadingsModule {}
