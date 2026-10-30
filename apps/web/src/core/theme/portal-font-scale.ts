import { PortalFontScale } from '@contenster/shared';

const multiplierByScale: Record<PortalFontScale, number> = {
  [PortalFontScale.small]: 0.9,
  [PortalFontScale.standard]: 1,
  [PortalFontScale.large]: 1.15,
};

export const getPortalFontScaleMultiplier = (scale: PortalFontScale): number =>
  multiplierByScale[scale];

export const portalFontSize = (size: number): string =>
  `calc(${size}px * var(--portal-font-scale, 1))`;

export const portalFontSizeImportant = (size: number): string =>
  `${portalFontSize(size)} !important`;
