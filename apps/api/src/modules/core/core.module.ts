import { Module } from '@nestjs/common';

import { AccessControlModule } from './access-control/access-control.module';
import { ActionsModule } from './authorization/actions/actions.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { CommunicationModule } from './communication/communication.module';
import { IdentityModule } from './identity/identity.module';
import { LocationsModule } from './locations/locations.module';
import { MediaModule } from './media/media.module';
import { ObservabilityModule } from './observability/observability.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SystemAdminModule } from './system-admin/system-admin.module';
import { PublicPortalModule } from './public-portal';

@Module({
  imports: [
    AccessControlModule,
    ActionsModule,
    AuthorizationModule,
    CommunicationModule,
    IdentityModule,
    LocationsModule,
    MediaModule,
    ObservabilityModule,
    PublicPortalModule,
    SchedulingModule,
    SystemAdminModule,
  ],
  exports: [ObservabilityModule],
})
export class CoreModule {}
