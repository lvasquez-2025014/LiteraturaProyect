import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module.js';
import { StagesService } from './services/stages.service.js';
import { StagesController } from './stages.controller.js';

@Module({
  imports: [DatabaseModule],
  providers: [StagesService],
  controllers: [StagesController],
  exports: [StagesService],
})
export class StagesModule {}
