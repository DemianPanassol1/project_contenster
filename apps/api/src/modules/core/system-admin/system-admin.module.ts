import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Action } from '@/modules/core/authorization/actions/entities/action.entity';
import { Language } from '@/modules/core/communication/languages/entities/language.entity';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { User } from '@/modules/core/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { File } from '@/modules/core/media/files/entities/file.entity';
import { RequestLog } from '@/modules/core/observability/request-logs/entities/request-log.entity';
import { CronExecutionLog } from '@/modules/core/scheduling/cron-execution-log/entities/cron-execution-log.entity';

import { PortalsModule } from './portals';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminRepository } from './system-admin.repository';
import { SystemAdminService } from './system-admin.service';

@Module({
  imports: [
    PortalsModule,
    TypeOrmModule.forFeature([
      Client,
      Action,
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
