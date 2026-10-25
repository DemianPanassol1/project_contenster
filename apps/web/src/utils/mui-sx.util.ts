import type { SxProps, Theme } from '@mui/material/styles';

type SxArrayItem = Exclude<SxProps<Theme>, readonly unknown[]>;

const isSxArrayItem = (value: unknown): value is SxArrayItem =>
  value !== false && value !== null && value !== undefined;

export const toSxArray = (sx: SxProps<Theme> | undefined): SxArrayItem[] => {
  if (!sx) {
    return [];
  }

  if (Array.isArray(sx)) {
    const items: readonly unknown[] = sx;

    return items.filter(isSxArrayItem);
  }

  return [sx as SxArrayItem];
};
