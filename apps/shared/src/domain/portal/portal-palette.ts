export interface PortalPalette {
  background: string;
  error: string;
  link: string;
  paper: string;
  primary: string;
  secondary: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
  warning: string;
}

export const defaultPortalLightPalette: PortalPalette = {
  background: '#F8FAFC',
  error: '#E11D48',
  link: '#5B5BD6',
  paper: '#FFFFFF',
  primary: '#5B5BD6',
  secondary: '#64748B',
  success: '#16A34A',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  warning: '#D97706',
};

export const defaultPortalDarkPalette: PortalPalette = {
  background: '#111827',
  error: '#FDA4AF',
  link: '#A5B4FC',
  paper: '#1F2937',
  primary: '#A5B4FC',
  secondary: '#94A3B8',
  success: '#4ADE80',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  warning: '#FBBF24',
};
