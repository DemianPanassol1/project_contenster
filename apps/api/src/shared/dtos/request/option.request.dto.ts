import type {
  FieldType,
  FilterItem,
  FilterOperator,
  OptionRequest,
  PaginationRequest,
  SortDirection,
  SortItem,
} from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toBoolean, toNumber } from '@/shared/transformers/dto';

const MAX_PER_PAGE = 1000;
const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];
const FIELD_TYPES: FieldType[] = ['boolean', 'date', 'datetime', 'number', 'string'];
const FILTER_OPERATORS: FilterOperator[] = [
  'between',
  'contains',
  'ends_with',
  'equals',
  'gt',
  'gte',
  'in',
  'is_not_null',
  'is_null',
  'lt',
  'lte',
  'starts_with',
];

class SortItemDto implements SortItem {
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty({ type: String })
  declare field: string;

  @IsIn(SORT_DIRECTIONS, { message: i18n('validation.enum') })
  @ApiProperty({ enum: SORT_DIRECTIONS })
  declare direction: SortDirection;
}

class FilterItemDto implements FilterItem {
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty({ type: String })
  declare field: string;

  @IsIn(FILTER_OPERATORS, { message: i18n('validation.enum') })
  @ApiProperty({ enum: FILTER_OPERATORS })
  declare operator: FilterOperator;

  @IsOptional()
  @ApiPropertyOptional({ nullable: true })
  value: unknown = null;

  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiPropertyOptional({ type: Boolean, nullable: true })
  disjunctive: boolean | null = null;

  @IsOptional()
  @IsIn(FIELD_TYPES, { message: i18n('validation.enum') })
  @ApiPropertyOptional({ enum: FIELD_TYPES, nullable: true })
  type: FieldType | null = null;
}

class PaginationRequestDto implements PaginationRequest {
  @Transform(toNumber)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ type: Number })
  page = 1;

  @Transform(toNumber)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @Max(MAX_PER_PAGE, { message: i18n('validation.max') })
  @ApiPropertyOptional({ type: Number })
  perPage = MAX_PER_PAGE;

  @IsOptional()
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SortItemDto)
  @ApiPropertyOptional({ type: [SortItemDto] })
  sort: SortItemDto[] = [];

  @IsOptional()
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  @ApiPropertyOptional({ type: [FilterItemDto] })
  filters: FilterItemDto[] = [];
}

export class OptionRequestDto implements OptionRequest {
  @ValidateNested()
  @Type(() => PaginationRequestDto)
  @ApiPropertyOptional({ type: () => PaginationRequestDto })
  pagination = new PaginationRequestDto();

  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiPropertyOptional({ type: Boolean, nullable: true })
  isOptional: boolean | null = null;
}
