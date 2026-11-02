import { Module } from '@nestjs/common';

import { SystemAdminAccessModelsModule } from '@/modules/core/system-admin/access-models/access-models.module';

import { AccessModelsController } from './access-models.controller';

@Module({ imports: [SystemAdminAccessModelsModule], controllers: [AccessModelsController] })
export class AccessModelsModule {}
