import { Module } from '@nestjs/common';

import { FunctionalityModule } from './functionalities/functionality.module';
import { SystemModulesModule } from './modules/system-module.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({ imports: [SystemModulesModule, FunctionalityModule, ProfilesModule] })
export class AccessControlModule {}
