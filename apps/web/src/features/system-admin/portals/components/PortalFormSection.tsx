import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { portalFontSize } from '@/core/theme';

interface PortalFormSectionProps {
  children: ReactNode;
  description: string;
  title: string;
}

export function PortalFormSection({ children, description, title }: PortalFormSectionProps) {
  return (
    <Box>
      <Typography sx={{ fontSize: portalFontSize(14), fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: portalFontSize(12.5), mt: 0.25 }}>
        {description}
      </Typography>
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Box>
  );
}
