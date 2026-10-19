import { Module } from '@nestjs/common';

import { AuthenticationModule } from './authentication/authentication.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthenticationModule, ClientsModule, UsersModule],
  exports: [AuthenticationModule],
})
export class IdentityModule {}
