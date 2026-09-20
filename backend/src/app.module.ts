import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ReadingsModule } from './modules/readings/readings.module.js';
import { StagesModule } from './modules/stages/stages.module.js';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    ReadingsModule,
    StagesModule,
  ],
})
export class AppModule {}

