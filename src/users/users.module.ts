import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/modules/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userProviders } from './users.providers';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
    ...userProviders
  ],
  exports: [
    UsersService
  ],
})
export class UsersModule { }