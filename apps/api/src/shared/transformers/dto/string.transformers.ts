import type { TransformFnParams } from 'class-transformer';

import { parseString, parseStringArray } from '@contenster/shared';

export const toString = ({ value }: TransformFnParams): string | null => parseString(value);

export const toLowercaseString = ({ value }: TransformFnParams): string | null => {
  const parsedValue = parseString(value);

  return parsedValue?.toLowerCase() ?? null;
};

export const toUppercaseString = ({ value }: TransformFnParams): string | null => {
  const parsedValue = parseString(value);

  return parsedValue?.toUpperCase() ?? null;
};

export const toStringArray = ({ value }: TransformFnParams): string[] => parseStringArray(value);
