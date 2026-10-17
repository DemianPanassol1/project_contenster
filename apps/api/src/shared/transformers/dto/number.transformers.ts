import type { TransformFnParams } from 'class-transformer';

import { parseInteger, parseNumber, parseNumberArray } from '@contenster/shared';

export const toNumber = ({ value }: TransformFnParams): number | null => parseNumber(value);

export const toOptionalNumber = ({ value }: TransformFnParams): number | null => parseNumber(value);

export const toInteger = ({ value }: TransformFnParams): number | null => parseInteger(value);

export const toNumberArray = ({ value }: TransformFnParams): number[] => parseNumberArray(value);
