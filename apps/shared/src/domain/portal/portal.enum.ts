export enum PortalFontScale {
  small = 'small',
  standard = 'standard',
  large = 'large',
}

export const portalFontScaleDictionary = {
  [PortalFontScale.small]: 'enums.portal_font_scale.small',
  [PortalFontScale.standard]: 'enums.portal_font_scale.standard',
  [PortalFontScale.large]: 'enums.portal_font_scale.large',
} as const satisfies Record<PortalFontScale, string>;

export enum PortalLoginHeaderMode {
  text = 'text',
  brandAsset = 'brand_asset',
}

export const portalLoginHeaderModeDictionary = {
  [PortalLoginHeaderMode.text]: 'enums.portal_login_header_mode.text',
  [PortalLoginHeaderMode.brandAsset]: 'enums.portal_login_header_mode.brand_asset',
} as const satisfies Record<PortalLoginHeaderMode, string>;

export enum PortalLoginLayout {
  centered = 'centered',
  split = 'split',
}

export const portalLoginLayoutDictionary = {
  [PortalLoginLayout.centered]: 'enums.portal_login_layout.centered',
  [PortalLoginLayout.split]: 'enums.portal_login_layout.split',
} as const satisfies Record<PortalLoginLayout, string>;

export enum PortalSplitMediaPosition {
  left = 'left',
  right = 'right',
}

export const portalSplitMediaPositionDictionary = {
  [PortalSplitMediaPosition.left]: 'enums.portal_split_media_position.left',
  [PortalSplitMediaPosition.right]: 'enums.portal_split_media_position.right',
} as const satisfies Record<PortalSplitMediaPosition, string>;

export enum PortalLoginMediaSlot {
  centeredBackgroundDesktop = 'centered_background_desktop',
  centeredBackgroundMobile = 'centered_background_mobile',
  splitPanelDesktop = 'split_panel_desktop',
  splitPanelMobile = 'split_panel_mobile',
}

export const portalLoginMediaSlotDictionary = {
  [PortalLoginMediaSlot.centeredBackgroundDesktop]:
    'enums.portal_login_media_slot.centered_background_desktop',
  [PortalLoginMediaSlot.centeredBackgroundMobile]:
    'enums.portal_login_media_slot.centered_background_mobile',
  [PortalLoginMediaSlot.splitPanelDesktop]: 'enums.portal_login_media_slot.split_panel_desktop',
  [PortalLoginMediaSlot.splitPanelMobile]: 'enums.portal_login_media_slot.split_panel_mobile',
} as const satisfies Record<PortalLoginMediaSlot, string>;

export enum PortalLoginMediaType {
  image = 'image',
  video = 'video',
}

export const portalLoginMediaTypeDictionary = {
  [PortalLoginMediaType.image]: 'enums.portal_login_media_type.image',
  [PortalLoginMediaType.video]: 'enums.portal_login_media_type.video',
} as const satisfies Record<PortalLoginMediaType, string>;
