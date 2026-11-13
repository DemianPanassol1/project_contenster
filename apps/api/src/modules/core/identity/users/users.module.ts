import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesModule } from '@/modules/core/access-control/profiles/profiles.module';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';

import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile]), AuthenticationModule, ProfilesModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
