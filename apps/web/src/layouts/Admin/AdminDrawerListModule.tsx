import { Collapse, List, ListSubheader, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminDrawerListModuleProps {
  children: ReactNode;
  drawerOpen: boolean;
  title: string;
}

export function AdminDrawerListModule({ children, drawerOpen, title }: AdminDrawerListModuleProps) {
  return (
    <List
      disablePadding
      subheader={
        <Collapse in={drawerOpen} timeout="auto" unmountOnExit>
          <ListSubheader
            disableSticky
            sx={{ backgroundColor: 'transparent', lineHeight: 1, pb: 1, pt: 3, px: 2.5 }}
          >
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>
          </ListSubheader>
        </Collapse>
      }
    >
      {children}
    </List>
  );
}
