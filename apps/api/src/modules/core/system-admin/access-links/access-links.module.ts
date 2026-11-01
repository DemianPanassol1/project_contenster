import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { User } from '@/modules/core/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';

import { AccessLinksController } from './access-links.controller';
import { AccessLinksRepository } from './access-links.repository';
import { AccessLinksService } from './access-links.service';

@Module({
  imports: [AuthenticationModule, TypeOrmModule.forFeature([Client, Profile, User, UserProfile])],
  controllers: [AccessLinksController],
  providers: [AccessLinksRepository, AccessLinksService],
})
export class AccessLinksModule {}
