import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { AccessModelsService } from '@/modules/core/system-admin/access-models/access-models.service';
import { ApplyAccessModelRequestDto } from '@/modules/core/system-admin/access-models/dto/req/apply-access-model.request.dto';
import { PreviewAccessModelRequestDto } from '@/modules/core/system-admin/access-models/dto/req/preview-access-model.request.dto';
import { PaginateRequestDto } from '@/shared/dtos';

const { accessModels } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Access models')
@Controller('access-models')
export class AccessModelsController {
  constructor(private readonly service: AccessModelsService) {}

  @Post('list')
  @RequirePermission(accessModels, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('preview')
  @RequirePermission(accessModels, ActionType.view)
  preview(@CurrentClientId() clientId: number, @Body() request: PreviewAccessModelRequestDto) {
    return this.service.preview(request.modelId, clientId);
  }

  @Post('apply')
  @RequirePermission(accessModels, ActionType.edit)
  apply(@CurrentClientId() clientId: number, @Body() request: ApplyAccessModelRequestDto) {
    return this.service.apply(
      request.modelId,
      clientId,
      request.fingerprint,
      request.selectedChangeIds,
    );
  }
}
