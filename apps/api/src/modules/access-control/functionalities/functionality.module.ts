import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemModule } from '@/modules/access-control/modules/entities/system-module.entity';
import { SystemModulesModule } from '@/modules/access-control/modules/system-module.module';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';

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
      SystemModule,
      Language,
    ]),
    AuthenticationModule,
    SystemModulesModule,
  ],
  controllers: [FunctionalityController],
  providers: [FunctionalityRepository, FunctionalityService],
  exports: [FunctionalityRepository],
})
export class FunctionalityModule {}
