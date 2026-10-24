import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { FileModule } from '@/modules/media/files/file.module';

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
