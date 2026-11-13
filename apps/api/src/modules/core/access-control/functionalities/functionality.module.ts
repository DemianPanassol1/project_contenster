import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemModulesModule } from '@/modules/core/access-control/modules/system-module.module';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { ClientsModule } from '@/modules/core/identity/clients/clients.module';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { Functionality } from './entities/functionality.entity';
import { FunctionalityClientLanguage } from './entities/functionality-client-language.entity';
import { FunctionalityTranslation } from './entities/functionality-translation.entity';
import { FunctionalityController } from './functionality.controller';
import { FunctionalityRepository } from './functionality.repository';
import { FunctionalityService } from './functionality.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Functionality,
      FunctionalityTranslation,
      FunctionalityClientLanguage,
      Language,
    ]),
    AuthenticationModule,
    ClientsModule,
    SystemModulesModule,
  ],
  controllers: [FunctionalityController],
  providers: [FunctionalityRepository, FunctionalityService],
  exports: [FunctionalityService],
})
export class FunctionalityModule {}
