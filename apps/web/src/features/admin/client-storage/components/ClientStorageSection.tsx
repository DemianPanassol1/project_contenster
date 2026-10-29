import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ClientStorageSectionProps {
  children: ReactNode;
  description: string;
  title: string;
}

export function ClientStorageSection({ title, description, children }: ClientStorageSectionProps) {
  return (
    <Paper elevation={1} square={false} sx={{ px: 2, py: 2.5 }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}
