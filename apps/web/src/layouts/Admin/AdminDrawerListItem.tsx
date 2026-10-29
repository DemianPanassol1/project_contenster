'use client';

import type { SessionFunctionality } from '@contenster/shared';
import {
  Box,
  Collapse,
  IconButton as MuiIconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Icon, iconNames } from '@/shared';

interface AdminDrawerListItemProps {
  depth?: number;
  drawerOpen: boolean;
  functionality: SessionFunctionality;
  isLoading: boolean;
}

const hasSelectedDescendant = (functionality: SessionFunctionality, pathname: string): boolean =>
  functionality.children.some(
    (child) =>
      pathname === `/admin/${child.slug}` ||
      pathname.startsWith(`/admin/${child.slug}/`) ||
      hasSelectedDescendant(child, pathname),
  );

const isSupportedIcon = (value: string | null): value is (typeof iconNames)[number] =>
  value !== null && iconNames.includes(value as (typeof iconNames)[number]);

export function AdminDrawerListItem({
  depth = 0,
  drawerOpen,
  functionality,
  isLoading,
}: AdminDrawerListItemProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const childrenListId = useId();
  const selected =
    pathname === `/admin/${functionality.slug}` ||
    pathname.startsWith(`/admin/${functionality.slug}/`);
  const hasChildren = functionality.children.length > 0;
  const isNested = depth > 0;
  const initiallyExpanded = selected || hasSelectedDescendant(functionality, pathname);
  const [expansionOverride, setExpansionOverride] = useState<{
    pathname: string;
    value: boolean;
  } | null>(null);
  const expanded =
    expansionOverride?.pathname === pathname ? expansionOverride.value : initiallyExpanded;
  const iconName = isSupportedIcon(functionality.icon) ? functionality.icon : null;

  const toggleExpanded = () => {
    setExpansionOverride({ pathname, value: !expanded });
  };

  const navigate = () => {
    router.push(`/admin/${functionality.slug}`);
  };

  const itemContent = (
    <>
      {isNested ? (
        <Box
          sx={{
            backgroundColor: 'primary.dark',
            borderRadius: '50%',
            height: 4,
            mr: 1.25,
            mt: 0.25,
            opacity: selected ? 1 : 0,
            transition: 'opacity .2s ease',
            width: 4,
          }}
        />
      ) : (
        iconName && (
          <ListItemIcon
            sx={{
              color: 'text.secondary',
              justifyContent: drawerOpen ? undefined : 'center',
              minWidth: 28,
            }}
          >
            <Icon
              color={selected ? theme.palette.primary.dark : undefined}
              name={iconName}
              size={17}
              strokeWidth={1.85}
            />
          </ListItemIcon>
        )
      )}

      {drawerOpen && (
        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{
                color: selected ? 'primary.dark' : isNested ? 'text.secondary' : 'text.primary',
                fontSize: isNested ? '12.5px' : '13px',
                fontWeight: selected ? 600 : 500,
              }}
            >
              {functionality.name}
            </Typography>
          }
        />
      )}

      {drawerOpen && hasChildren && functionality.isNavigationGroup && (
        <ChevronDown
          color={expanded ? theme.palette.primary.dark : undefined}
          size={14}
          strokeWidth={2}
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s ease',
          }}
        />
      )}
    </>
  );

  const itemSx = {
    borderRadius: isNested ? '8px' : '10px',
    color: 'text.primary',
    height: isNested ? undefined : 34,
    minHeight: isNested ? 30 : 34,
    mt: isNested ? 0 : 0.25,
    pl: 1.25,
    pr: drawerOpen && hasChildren && !functionality.isNavigationGroup ? 4 : 0.5,
    py: 0,
    transition: 'all .2s ease',
    width: '100%',
    ...(selected && {
      backgroundColor: 'action.hover',
      color: 'primary.dark',
      ...(!isNested && {
        '&::before': {
          backgroundColor: 'primary.dark',
          borderRadius: '0 999px 999px 0',
          bottom: 6,
          content: '""',
          left: 0,
          position: 'absolute',
          top: 6,
          width: 3,
        },
      }),
    }),
    '&:hover': { backgroundColor: 'action.hover' },
  };

  return (
    <Box sx={{ px: 1 }}>
      <Tooltip placement="right" title={drawerOpen ? '' : functionality.name}>
        <Box sx={{ position: 'relative' }}>
          <ListItemButton
            aria-controls={hasChildren ? childrenListId : undefined}
            aria-current={selected ? 'page' : undefined}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-label={drawerOpen ? undefined : functionality.name}
            disabled={isLoading}
            onClick={functionality.isNavigationGroup ? toggleExpanded : navigate}
            sx={itemSx}
          >
            {itemContent}
          </ListItemButton>

          {drawerOpen && hasChildren && !functionality.isNavigationGroup && (
            <MuiIconButton
              aria-controls={childrenListId}
              aria-expanded={expanded}
              aria-label={
                expanded ? `Collapse ${functionality.name}` : `Expand ${functionality.name}`
              }
              disabled={isLoading}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleExpanded();
              }}
              size="small"
              sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronDown
                color={expanded ? theme.palette.primary.dark : undefined}
                size={14}
                strokeWidth={2}
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform .2s ease',
                }}
              />
            </MuiIconButton>
          )}
        </Box>
      </Tooltip>

      {drawerOpen && hasChildren && (
        <Collapse id={childrenListId} in={expanded} timeout="auto">
          <List
            disablePadding
            sx={{
              borderLeft: '1px solid #E5E7EB',
              ml: '18px',
              mt: 0.5,
              pl: 1.5,
            }}
          >
            {functionality.children.map((child) => (
              <AdminDrawerListItem
                depth={depth + 1}
                drawerOpen={drawerOpen}
                functionality={child}
                isLoading={isLoading}
                key={child.id}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
}
