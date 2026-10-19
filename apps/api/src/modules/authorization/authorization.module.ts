import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilePermission } from '@/modules/access-control/profiles/entities/profile-permission.entity';

import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationResolverService } from './authorization-resolver.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilePermission])],
  providers: [AuthorizationRepository, AuthorizationResolverService],
  exports: [AuthorizationResolverService],
})
export class AuthorizationModule {}
