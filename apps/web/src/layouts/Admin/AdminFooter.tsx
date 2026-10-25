import { Box, Typography } from '@mui/material';

export function AdminFooter() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', px: 3, py: 1.5 }}>
      <Typography color="text.secondary" variant="caption">
        Contenster Slim Core
      </Typography>
    </Box>
  );
}
