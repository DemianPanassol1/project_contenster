import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { RequestLog } from '@/modules/observability/request-logs/entities/request-log.entity';
import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';

import { PortalsModule } from './portals';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminRepository } from './system-admin.repository';
import { SystemAdminService } from './system-admin.service';

@Module({
  imports: [
    PortalsModule,
    TypeOrmModule.forFeature([
      Client,
      File,
      CronExecutionLog,
      Language,
      Profile,
      RequestLog,
      User,
      UserProfile,
    ]),
  ],
  controllers: [SystemAdminController],
  providers: [SystemAdminRepository, SystemAdminService],
})
export class SystemAdminModule {}
