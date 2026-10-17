import type { TransformFnParams } from 'class-transformer';

import { parseBoolean } from '@contenster/shared';

export const toBoolean = ({ value }: TransformFnParams): boolean | null => parseBoolean(value);

export const toOptionalBoolean = ({ value }: TransformFnParams): boolean | null =>
  parseBoolean(value);
