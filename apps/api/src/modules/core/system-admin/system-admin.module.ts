import { Module } from '@nestjs/common';

import { AccessLinksModule } from './access-links/access-links.module';
import { ClientsModule } from './clients/clients.module';
import { FilesModule } from './files/files.module';
import { JobLogsModule } from './job-logs/job-logs.module';
import { RequestLogsModule } from './request-logs/request-logs.module';
import { PortalsModule } from './portals';
import { SystemAdminController } from './system-admin.controller';

@Module({
  imports: [
    AccessLinksModule,
    ClientsModule,
    FilesModule,
    JobLogsModule,
    PortalsModule,
    RequestLogsModule,
  ],
  controllers: [SystemAdminController],
})
export class SystemAdminModule {}
