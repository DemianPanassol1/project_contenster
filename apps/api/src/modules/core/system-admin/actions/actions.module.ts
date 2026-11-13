import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { Action } from './entities/action.entity';
import { ActionTranslation } from './entities/action-translation.entity';
import { SystemAdminActionsController } from './actions.controller';
import { ActionsRepository } from './actions.repository';
import { ActionsService } from './actions.service';

@Module({
  imports: [AuthenticationModule, TypeOrmModule.forFeature([Action, ActionTranslation, Language])],
  controllers: [SystemAdminActionsController],
  providers: [ActionsRepository, ActionsService],
  exports: [ActionsService],
})
export class SystemAdminActionsModule {}
