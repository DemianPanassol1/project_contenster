import { Box, type SxProps, type Theme, useTheme } from '@mui/material';

import { PageHero } from './PageHero';

interface PageProps {
  children: React.ReactNode;
  module: string;
  functionality: string;
  description?: string;
  actions?: React.ReactNode | false;
  actionsSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
}

export const Page = ({
  children,
  module,
  functionality,
  description,
  actions,
  actionsSx,
  sx,
}: PageProps) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: '16px 24px 48px',
        [theme.breakpoints.up('md')]: {
          padding: '24px 32px 64px',
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          minWidth: 0,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <PageHero
          module={module}
          description={description}
          functionality={functionality}
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            mb: actions ? { xs: 2, sm: 4 } : 4,
          }}
        />
        {actions && (
          <Box
            sx={{
              flex: '0 1 auto',
              gap: 1.5,
              display: 'flex',
              minWidth: 0,
              maxWidth: '100%',
              mb: 4,
              flexWrap: 'wrap',
              alignItems: 'center',
              alignSelf: { xs: 'stretch', sm: 'flex-start' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              ...actionsSx,
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
};
