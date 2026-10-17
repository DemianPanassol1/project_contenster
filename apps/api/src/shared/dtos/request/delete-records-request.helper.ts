import { BadRequestException } from '@nestjs/common';

import type { DeleteRecordsRequestDto } from './delete-records.request.dto';

export const normalizeDeleteRecordIds = (
  request: DeleteRecordsRequestDto,
  invalidMessage: string,
): number[] => {
  const hasId = Number.isInteger(request.id);
  const hasIds = request.ids.length > 0;

  if (hasId === hasIds) {
    throw new BadRequestException(invalidMessage);
  }

  return hasId ? [request.id as number] : Array.from(new Set(request.ids));
};
