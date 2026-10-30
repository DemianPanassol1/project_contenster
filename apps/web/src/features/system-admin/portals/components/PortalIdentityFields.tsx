'use client';

import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Controller, type FieldPath, useFormContext, useWatch } from 'react-hook-form';

import {
  ICO_MIME_TYPES,
  PortalFontScale,
  PortalLoginHeaderMode,
  SVG_MIME_TYPE,
} from '@contenster/shared';
import { API_ROUTES } from '@/routes';
import { FormImageUpload, FormSelect } from '@/shared';

import type { PortalFormValues } from '../types/portal-form.types';
import { defaultPortalDarkPalette, defaultPortalLightPalette } from '../types/portal-form.utils';

import { PortalFormSection } from './PortalFormSection';

const paletteFields = [
  'primary',
  'secondary',
  'background',
  'paper',
  'success',
  'warning',
  'error',
] as const;

function PortalColorField({
  color,
  mode,
}: {
  color: (typeof paletteFields)[number];
  mode: 'light' | 'dark';
}) {
  const t = useTranslations('protected.system_admin.portals');
  const inputId = useId();
  const name = `${mode}Palette.${color}` as FieldPath<PortalFormValues>;
  const defaultValue = (mode === 'light' ? defaultPortalLightPalette : defaultPortalDarkPalette)[
    color
  ];

  return (
    <Controller<PortalFormValues>
      name={name}
      rules={{
        pattern: { message: t('validation.color_invalid'), value: /^#[0-9a-f]{6}$/i },
        required: t('validation.color_required'),
      }}
      render={({ field, fieldState }) => {
        const value = typeof field.value === 'string' ? field.value : '';
        const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
        const helperId = `${inputId}-helper`;

        return (
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: fieldState.error ? 'error.main' : 'divider',
              borderRadius: 1.25,
              minWidth: 0,
              p: 1.5,
            }}
          >
            <Typography
              component="label"
              htmlFor={inputId}
              sx={{ display: 'block', fontSize: 13, fontWeight: 700 }}
            >
              {t(`identity.colors.${color}.label`)}
              <Box component="span" sx={{ color: 'error.main' }}>
                {' '}
                *
              </Box>
            </Typography>
            <Typography
              sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 11, mt: 0.15 }}
              title={`color_${color}`}
            >
              {`color_${color}`}
            </Typography>
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mt: 1 }}>
              <Box
                component="label"
                sx={{
                  bgcolor: colorValue,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  flexShrink: 0,
                  height: 34,
                  overflow: 'hidden',
                  position: 'relative',
                  width: 34,
                  '&:focus-within': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  aria-describedby={helperId}
                  aria-label={t('identity.colors.select', {
                    color: t(`identity.colors.${color}.label`),
                  })}
                  aria-invalid={Boolean(fieldState.error)}
                  component="input"
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.currentTarget.value.toUpperCase())}
                  required
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    inset: 0,
                    opacity: 0,
                    position: 'absolute',
                    width: '100%',
                  }}
                  type="color"
                  value={colorValue}
                />
              </Box>
              <TextField
                error={Boolean(fieldState.error)}
                fullWidth
                id={inputId}
                inputRef={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                placeholder="#RRGGBB"
                size="small"
                slotProps={{
                  htmlInput: { 'aria-describedby': helperId, maxLength: 7, spellCheck: false },
                }}
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12, px: 1.25 },
                  '& .MuiOutlinedInput-root': { borderRadius: 1, height: 34 },
                }}
                value={value}
              />
            </Box>
            <FormHelperText
              error={Boolean(fieldState.error)}
              id={helperId}
              sx={{ fontSize: 11.5, mt: 0.75, mx: 0 }}
            >
              {fieldState.error?.message ??
                t(`identity.colors.${color}.helper`, { value: defaultValue })}
            </FormHelperText>
          </Box>
        );
      }}
    />
  );
}

function PortalPalette({ mode }: { mode: 'light' | 'dark' }) {
  const t = useTranslations('protected.system_admin.portals');

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
        {t(`identity.${mode}_palette`)}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
          mt: 1.5,
        }}
      >
        {paletteFields.map((color) => (
          <PortalColorField key={color} color={color} mode={mode} />
        ))}
      </Box>
    </Box>
  );
}

export function PortalIdentityFields() {
  const t = useTranslations('protected.system_admin.portals');
  const { control } = useFormContext<PortalFormValues>();
  const loginHeaderMode = useWatch({ control, name: 'loginHeaderMode' });

  return (
    <Stack spacing={3}>
      <PortalFormSection
        description={t('identity.palette_description')}
        title={t('identity.palette_title')}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { lg: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
          }}
        >
          <PortalPalette mode="light" />
          <PortalPalette mode="dark" />
        </Box>
      </PortalFormSection>

      <PortalFormSection
        description={t('identity.typography_description')}
        title={t('identity.typography_title')}
      >
        <Box sx={{ maxWidth: 360 }}>
          <FormSelect<PortalFormValues>
            helperText={t('helpers.font_scale')}
            label={t('fields.font_scale')}
            name="fontScale"
            options={Object.values(PortalFontScale).map((value) => ({
              label: t(`values.font_scale.${value}`),
              value,
            }))}
            rules={{ required: t('validation.font_scale_required') }}
            textFieldProps={{ required: true }}
          />
        </Box>
      </PortalFormSection>

      <PortalFormSection
        description={t('identity.assets_description')}
        title={t('identity.assets_title')}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { lg: 'repeat(3, minmax(0, 1fr))', xs: '1fr' },
          }}
        >
          <FormImageUpload<PortalFormValues>
            accept={['image/png', SVG_MIME_TYPE, ...ICO_MIME_TYPES, '.ico'].join(',')}
            emptyStateDescription={t('identity.favicon_upload.description')}
            emptyStateTitle={t('identity.favicon_upload.title')}
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.favicon')}
            label={t('fields.favicon')}
            name="faviconFileId"
            previewMode="uploaded"
            uploadButtonLabel={t('identity.favicon_upload.action')}
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
          <FormImageUpload<PortalFormValues>
            accept={[SVG_MIME_TYPE, ...ICO_MIME_TYPES].join(',')}
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.header_icon')}
            label={t('fields.header_icon')}
            name="headerIconFileId"
            previewMode="uploaded"
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
          <FormImageUpload<PortalFormValues>
            accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
            fileEndpoint={API_ROUTES.SYSTEM_ADMIN.GET_PORTAL_MEDIA}
            helperText={t('helpers.brand_asset')}
            label={t('fields.brand_asset')}
            name="brandAssetFileId"
            previewMode="uploaded"
            rules={{
              validate: (value) =>
                loginHeaderMode !== PortalLoginHeaderMode.brandAsset ||
                value !== null ||
                t('validation.brand_asset_required'),
            }}
            uploadEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_MEDIA}
          />
        </Box>
      </PortalFormSection>
    </Stack>
  );
}
