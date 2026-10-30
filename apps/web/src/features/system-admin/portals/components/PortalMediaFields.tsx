'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import { PortalLoginLayout, PortalLoginMediaSlot, PortalLoginMediaType } from '@contenster/shared';
import { API_ROUTES } from '@/routes';
import { FormFileUpload, FormImageUpload, FormSelect } from '@/shared';

import type { PortalFormValues } from '../types/portal-form.types';

const mediaGroups = [
  {
    layout: PortalLoginLayout.centered,
    slots: [
      PortalLoginMediaSlot.centeredBackgroundDesktop,
      PortalLoginMediaSlot.centeredBackgroundMobile,
    ],
  },
  {
    layout: PortalLoginLayout.split,
    slots: [PortalLoginMediaSlot.splitPanelDesktop, PortalLoginMediaSlot.splitPanelMobile],
  },
] as const;

function PortalMediaSlot({ slot }: { slot: PortalLoginMediaSlot }) {
  const t = useTranslations('protected.system_admin.portals');
  const { control, setValue } = useFormContext<PortalFormValues>();
  const loginMedia = useWatch({ control, name: 'loginMedia' });
  const mediaType = useWatch({ control, name: `loginMedia.${slot}.mediaType` });

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2 }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{t(`media.slots.${slot}`)}</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <FormSelect<PortalFormValues>
          helperText={t('helpers.media_type')}
          label={t('fields.media_type')}
          name={`loginMedia.${slot}.mediaType`}
          options={Object.values(PortalLoginMediaType).map((value) => ({
            label: t(`values.media_type.${value}`),
            value,
          }))}
          onValueChange={(value) => {
            if (value !== PortalLoginMediaType.image && value !== PortalLoginMediaType.video)
              return;

            if (value === PortalLoginMediaType.image) {
              setValue(
                'loginMedia',
                {
                  ...loginMedia,
                  [slot]: { ...loginMedia[slot], mediaType: value, posterFileId: null },
                },
                { shouldDirty: true },
              );
            }
          }}
        />
        {mediaType === PortalLoginMediaType.video ? (
          <FormFileUpload<PortalFormValues>
            accept="video/mp4,video/quicktime,video/webm"
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.media_file')}
            label={t('fields.media_file')}
            name={`loginMedia.${slot}.fileId`}
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
        ) : (
          <FormImageUpload<PortalFormValues>
            accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.media_file')}
            label={t('fields.media_file')}
            name={`loginMedia.${slot}.fileId`}
            previewMode="uploaded"
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
        )}
        {mediaType === PortalLoginMediaType.video && (
          <FormImageUpload<PortalFormValues>
            accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.poster')}
            label={t('fields.poster')}
            name={`loginMedia.${slot}.posterFileId`}
            previewMode="uploaded"
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
        )}
      </Stack>
    </Box>
  );
}

export function PortalMediaFields() {
  const t = useTranslations('protected.system_admin.portals');
  const { control } = useFormContext<PortalFormValues>();
  const loginLayout = useWatch({ control, name: 'loginLayout' });
  const group = mediaGroups.find((item) => item.layout === loginLayout) ?? mediaGroups[0];

  return (
    <Stack spacing={2}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        {t('media.description')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { lg: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
        }}
      >
        {group.slots.map((slot) => (
          <PortalMediaSlot key={slot} slot={slot} />
        ))}
      </Box>
    </Stack>
  );
}
