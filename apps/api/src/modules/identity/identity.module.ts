import { Module } from '@nestjs/common';

import { AuthenticationModule } from './authentication/authentication.module';

@Module({ imports: [AuthenticationModule], exports: [AuthenticationModule] })
export class IdentityModule {}
