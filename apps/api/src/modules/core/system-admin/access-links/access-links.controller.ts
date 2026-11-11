import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { CreateAccessLinkUserRequestDto } from './dto/req/create-access-link-user.request.dto';
import { ReplaceUserAccessLinksRequestDto } from './dto/req/replace-user-access-links.request.dto';
import { AccessLinksService } from './access-links.service';

@ApiTags('System administration')
@Controller('system-admin')
@RequireSuperuser()
export class AccessLinksController {
  constructor(private readonly service: AccessLinksService) {}

  @Post('access-links/users/options')
  options(@Body() request: PaginateRequestDto) {
    return this.service.listUserOptions(request);
  }

  @Post('access-links/users')
  createUser(@Body() request: CreateAccessLinkUserRequestDto) {
    return this.service.createUser(request);
  }

  @Get('access-links/users/:userId')
  get(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getUserDetails(userId);
  }

  @Post('users/:userId/access-links') replace(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: ReplaceUserAccessLinksRequestDto,
  ) {
    return this.service.replace(userId, request);
  }
}
