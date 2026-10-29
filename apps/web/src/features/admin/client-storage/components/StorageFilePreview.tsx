import type { ClientStorageFileListItem } from '@contenster/shared';
import { Avatar, Box } from '@mui/material';

import { Icon } from '@/shared';

import { getStorageFileIconName } from '../utils/client-storage.utils';

export function StorageFilePreview({ file }: { file: ClientStorageFileListItem }) {
  const canPreviewImage = file.mimeType.startsWith('image/') && Boolean(file.url);

  if (canPreviewImage) {
    return (
      <Avatar
        src={file.url ?? undefined}
        sx={{ borderRadius: 1, height: 34, width: 34 }}
        variant="rounded"
      />
    );
  }

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'action.hover',
        borderRadius: 1,
        color: 'text.secondary',
        display: 'flex',
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      <Icon name={getStorageFileIconName(file.fileType)} size={17} />
    </Box>
  );
}
