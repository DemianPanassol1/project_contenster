import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';

import { SystemModule } from './entities/system-module.entity';
import { SystemModuleTranslation } from './entities/system-module-translation.entity';
import { SystemModulesController } from './system-module.controller';
import { SystemModulesRepository } from './system-module.repository';
import { SystemModulesService } from './system-module.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemModule, SystemModuleTranslation, Functionality, Language]),
    AuthenticationModule,
  ],
  controllers: [SystemModulesController],
  providers: [SystemModulesRepository, SystemModulesService],
  exports: [SystemModulesRepository],
})
export class SystemModulesModule {}
