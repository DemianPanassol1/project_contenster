import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from '@/modules/core/media/files/entities/file.entity';
import { FileModule } from '@/modules/core/media/files/file.module';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { Portal, PortalDomain, PortalLoginMedia, PortalTranslation } from './entities';
import { PortalsController } from './portals.controller';
import { PortalsRepository } from './portals.repository';
import { PortalsService } from './portals.service';

@Module({
  imports: [
    FileModule,
    TypeOrmModule.forFeature([
      File,
      Language,
      Portal,
      PortalDomain,
      PortalLoginMedia,
      PortalTranslation,
    ]),
  ],
  controllers: [PortalsController],
  providers: [PortalsRepository, PortalsService],
})
export class PortalsModule {}
