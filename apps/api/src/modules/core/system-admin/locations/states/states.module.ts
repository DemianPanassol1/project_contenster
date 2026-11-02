import { Module } from '@nestjs/common';

import { StatesModule } from '@/modules/core/locations/states/states.module';

import { SystemAdminStatesController } from './states.controller';

@Module({
  imports: [StatesModule],
  controllers: [SystemAdminStatesController],
})
export class SystemAdminStatesModule {}
