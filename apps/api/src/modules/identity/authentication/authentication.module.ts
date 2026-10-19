import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
import { PasswordRecoveryEmailService } from './password-recovery-email.service';
import { PasswordResetTokenStore } from './password-reset-token.store';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthorizationModule, JwtModule.register({})],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationRepository,
    AuthenticationService,
    PasswordRecoveryEmailService,
    PasswordResetTokenStore,
    RedisSessionStore,
    SessionAuthenticationService,
    SessionSynchronizationService,
    SessionTokenService,
  ],
  exports: [AuthenticationService, SessionAuthenticationService, SessionSynchronizationService],
})
export class AuthenticationModule {}
