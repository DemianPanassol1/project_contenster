import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteRecordsResponseDto {
  @Expose()
  @ApiProperty({ type: [Number] })
  declare ids: number[];
}
