import { Module } from '@nestjs/common';

import { AccessModelsModule } from './access-models/access-models.module';
import { FunctionalityModule } from './functionalities/functionality.module';
import { SystemModulesModule } from './modules/system-module.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({ imports: [AccessModelsModule, SystemModulesModule, FunctionalityModule, ProfilesModule] })
export class AccessControlModule {}
