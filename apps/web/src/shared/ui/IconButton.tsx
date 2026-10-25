import { IconButton as IconButtonMui, type SxProps, type Theme, Tooltip } from '@mui/material';

import { Icon, type icons } from './Icon';

interface IconButtonProps {
  icon: keyof typeof icons;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  toolTip?: string;
  iconSize?: number;
  hasToolTip?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  format?: 'square' | 'round';
  color?: string;
  size?: 'large' | 'medium' | 'small';
}

export const IconButton = ({
  icon,
  onClick,
  toolTip = '',
  iconSize = 20,
  hasToolTip = true,
  disabled = false,
  sx = {},
  format = 'square',
  color = 'currentColor',
  size = 'large',
}: IconButtonProps) => {
  const button = (
    <IconButtonMui
      sx={{
        ...(format === 'square' && {
          borderRadius: '14px',
        }),
        ...sx,
      }}
      size={size}
      onClick={onClick}
      disabled={disabled}
      aria-label={toolTip || icon}
    >
      <Icon name={icon} color={color} size={iconSize} />
    </IconButtonMui>
  );

  return hasToolTip ? (
    <Tooltip title={toolTip}>
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};
