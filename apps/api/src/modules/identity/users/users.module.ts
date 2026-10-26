import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { ProfilesModule } from '@/modules/access-control/profiles/profiles.module';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';

import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Profile]),
    AuthenticationModule,
    ProfilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
})
export class UsersModule {}
