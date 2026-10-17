import type { ValueTransformer } from 'typeorm';

export const createEnumValueTransformer = <TValue extends string>(): ValueTransformer => ({
  from: (value: TValue | null): TValue | null => value,
  to: (value: TValue | null): TValue | null => value,
});
