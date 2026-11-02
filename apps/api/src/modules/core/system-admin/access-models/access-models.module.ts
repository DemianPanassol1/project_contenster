import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { AccessModel } from './entities/access-model.entity';
import { AccessModelTranslation } from './entities/access-model-translation.entity';
import { SystemAdminAccessModelsController } from './access-models.controller';
import { AccessModelsRepository } from './access-models.repository';
import { AccessModelsService } from './access-models.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessModel, AccessModelTranslation, Language])],
  controllers: [SystemAdminAccessModelsController],
  providers: [AccessModelsRepository, AccessModelsService],
  exports: [AccessModelsService],
})
export class SystemAdminAccessModelsModule {}
