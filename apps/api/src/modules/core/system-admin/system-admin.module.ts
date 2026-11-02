import { Module } from '@nestjs/common';

import { AccessLinksModule } from './access-links/access-links.module';
import { SystemAdminAccessModelsModule } from './access-models/access-models.module';
import { SystemAdminActionsModule } from './actions/actions.module';
import { ClientsModule } from './clients/clients.module';
import { FilesModule } from './files/files.module';
import { JobLogsModule } from './job-logs/job-logs.module';
import { SystemAdminLanguagesModule } from './languages/languages.module';
import { SystemAdminLocationsModule } from './locations/locations.module';
import { RequestLogsModule } from './request-logs/request-logs.module';
import { PortalsModule } from './portals';
import { SystemAdminController } from './system-admin.controller';

@Module({
  imports: [
    AccessLinksModule,
    SystemAdminAccessModelsModule,
    SystemAdminActionsModule,
    ClientsModule,
    FilesModule,
    JobLogsModule,
    SystemAdminLanguagesModule,
    SystemAdminLocationsModule,
    PortalsModule,
    RequestLogsModule,
  ],
  controllers: [SystemAdminController],
})
export class SystemAdminModule {}
