import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';

import { Action } from './entities/action.entity';
import { ActionTranslation } from './entities/action-translation.entity';
import { ActionsController } from './actions.controller';
import { ActionsRepository } from './actions.repository';
import { ActionsService } from './actions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Action, ActionTranslation, Language]), AuthenticationModule],
  controllers: [ActionsController],
  providers: [ActionsRepository, ActionsService],
  exports: [ActionsRepository],
})
export class ActionsModule {}
