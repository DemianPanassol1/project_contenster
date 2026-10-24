import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortalDomain } from '@/modules/system-admin/portals/entities/portal-domain.entity';

import { PublicPortalController } from './public-portal.controller';
import { PublicPortalRepository } from './public-portal.repository';
import { PublicPortalService } from './public-portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortalDomain])],
  controllers: [PublicPortalController],
  providers: [PublicPortalRepository, PublicPortalService],
})
export class PublicPortalModule {}
