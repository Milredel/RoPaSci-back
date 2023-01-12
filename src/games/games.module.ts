import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/modules/database.module';
import { UsersModule } from 'src/users/users.module';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { gameProviders } from './games.providers';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    UsersModule,
  ],
  controllers: [
    GamesController,
  ],
  providers: [
    GamesService,
    ...gameProviders
  ],
  exports: [
    GamesService
  ],
})
export class GamesModule { }