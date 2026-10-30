import { Paper, Typography } from '@mui/material';

import { Page } from '@/shared/ui/Page';

interface SystemAdminFeatureSkeletonProps {
  description: string;
  functionality: string;
  module: string;
}

export function SystemAdminFeatureSkeleton({
  description,
  functionality,
  module,
}: SystemAdminFeatureSkeletonProps) {
  return (
    <Page description={description} functionality={functionality} module={module}>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </Paper>
    </Page>
  );
}
