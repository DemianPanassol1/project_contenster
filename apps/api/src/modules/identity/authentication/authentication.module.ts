import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@/modules/authorization/authorization.module';
import { User } from '@/modules/identity/users/entities/user.entity';

import { RedisSessionStore } from './session/redis-session.store';
import { SessionAuthenticationService } from './session/session-authentication.service';
import { SessionSynchronizationService } from './session/session-synchronization.service';
import { SessionTokenService } from './session/session-token.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationRepository } from './authentication.repository';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthorizationModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationRepository,
    AuthenticationService,
    RedisSessionStore,
    SessionAuthenticationService,
    SessionSynchronizationService,
    SessionTokenService,
  ],
  exports: [AuthenticationService, SessionAuthenticationService, SessionSynchronizationService],
})
export class AuthenticationModule {}
