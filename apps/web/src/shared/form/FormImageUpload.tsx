'use client';

import type { FileResponse } from '@contenster/shared';
import { Box, Button, FormControl, FormHelperText, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { type ChangeEvent, type ReactNode, useEffect, useId, useReducer, useState } from 'react';
import { Controller, type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import { useGlobalContext } from '@/core/providers';
import { portalFontSize } from '@/core/theme';
import { useGET } from '@/services/hooks';
import {
  getMediaFileEndpoint,
  type MediaFileEndpointResolver,
  uploadMediaFile,
} from '@/services/media';
import { Icon, IconButton } from '@/shared/ui';
import type { BaseFormFieldProps } from '@/types';
import { FormatUtils, toDisplayText } from '@/utils';

interface FormImageUploadProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string;
  disabled?: boolean;
  initialFile?: FileResponse | null;
  fileEndpoint?: MediaFileEndpointResolver;
  previewMode?: 'local' | 'uploaded';
  uploadEndpoint?: string;
  onUploadSuccess?: (file: FileResponse) => void;
  onDelete?: () => void;
  emptyStateTitle?: ReactNode;
  emptyStateDescription?: ReactNode;
  uploadButtonLabel?: ReactNode;
}

export const FormImageUpload = <T extends FieldValues>({
  name,
  rules,
  label,
  onDelete,
  helperText,
  onUploadSuccess,
  fileEndpoint,
  uploadEndpoint,
  accept = '*',
  disabled = false,
  initialFile = null,
  previewMode = 'local',
  emptyStateTitle,
  emptyStateDescription,
  uploadButtonLabel,
}: FormImageUploadProps<T>) => {
  const inputId = useId();
  const locale = useLocale();
  const { control } = useFormContext<T>();
  const { apiRequest } = useGlobalContext();
  const t = useTranslations();
  const fieldValue = useWatch({ control, name });

  const [{ fileData, localPreviewUrl }, dispatchUploadState] = useReducer(formImageUploadReducer, {
    fileData: initialFile,
    localPreviewUrl: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const fileId = getValidFileId(fieldValue);
  const shouldLoadFile = Boolean(fileId && fileData?.id !== fileId && !isUploading);
  const savedFileEndpoint =
    shouldLoadFile && fileId ? (fileEndpoint ?? getMediaFileEndpoint)(fileId) : null;
  const savedFile = useGET<FileResponse>(savedFileEndpoint);
  const isLoadingSavedFile = Boolean(shouldLoadFile && savedFile.isLoading);
  const hasLoadError = Boolean(savedFile.data && !savedFile.data.success);

  useEffect(() => {
    if (!fileId) {
      dispatchUploadState({ type: 'reset' });
    }
  }, [fileId]);

  useEffect(() => {
    if (initialFile && (!fileId || initialFile.id === fileId)) {
      dispatchUploadState({ type: 'setFileData', fileData: initialFile });
    }
  }, [fileId, initialFile]);

  useEffect(() => {
    if (fileId && savedFile.data?.success && savedFile.data.body) {
      dispatchUploadState({
        type: 'setFileData',
        fileData: savedFile.data.body,
        clearLocalPreviewUrl: true,
      });
    }
  }, [fileId, savedFile.data]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];

          event.target.value = '';

          if (!file) return;

          const previewUrl = previewMode === 'local' ? URL.createObjectURL(file) : null;

          if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl);
          }

          dispatchUploadState({ type: 'setLocalPreviewUrl', localPreviewUrl: previewUrl });

          try {
            setIsUploading(true);

            const uploadedFile = await uploadMediaFile(apiRequest, file, uploadEndpoint);

            if (!uploadedFile) return;

            dispatchUploadState({ type: 'setFileData', fileData: uploadedFile });
            field.onChange(uploadedFile.id);

            onUploadSuccess?.(uploadedFile);
          } finally {
            setIsUploading(false);
          }
        };

        const handleDelete = () => {
          dispatchUploadState({ type: 'reset' });
          field.onChange(null);

          onDelete?.();
        };

        const handleView = () => {
          if (!fileData?.url) return;

          window.open(fileData.url, '_blank');
        };

        const handleDownload = async () => {
          if (!fileData?.url) return;

          const response = await fetch(fileData.url);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = fileData.originalName;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
        };

        const hasValidDimensions =
          fileData?.width !== null &&
          fileData?.width !== undefined &&
          Number.isFinite(fileData.width) &&
          fileData.width > 0 &&
          fileData?.height !== null &&
          fileData?.height !== undefined &&
          Number.isFinite(fileData.height) &&
          fileData.height > 0;
        const imageDimensions = hasValidDimensions
          ? `${fileData.width} × ${fileData.height} px`
          : '';

        const imageMetadata = [
          {
            label: t('form.upload.size'),
            value: FormatUtils.formatFileSize(fileData?.size, locale),
          },
          { label: t('form.upload.dimensions'), value: imageDimensions },
          { label: t('form.upload.type'), value: fileData?.mimeType },
        ]
          .filter((item) => item.value)
          .map((item) => ({ ...item, value: String(item.value) }));

        const hasImage = Boolean(fileData || localPreviewUrl);

        return (
          <FormControl fullWidth error={!!fieldState.error}>
            {label && (
              <Typography
                component="label"
                htmlFor={inputId}
                sx={{
                  mb: 0.75,
                  display: 'block',
                  fontSize: portalFontSize(13),
                  fontWeight: 600,
                  color: disabled ? 'text.disabled' : 'text.primary',
                }}
              >
                {label}
              </Typography>
            )}

            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: '1fr',
              }}
            >
              {!hasImage && (
                <Box
                  sx={(theme) => ({
                    minHeight: 220,
                    p: 3,
                    gap: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: `1px dashed ${fieldState.error ? theme.palette.error.main : theme.palette.divider}`,
                    bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                    opacity: disabled ? 0.7 : 1,
                  })}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'grid',
                      borderRadius: 2,
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Icon name="image" size={22} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: portalFontSize(14),
                        fontWeight: 700,
                      }}
                    >
                      {emptyStateTitle ?? t('form.upload.image_empty_title')}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: portalFontSize(12),
                        color: 'text.secondary',
                      }}
                    >
                      {emptyStateDescription ?? t('form.upload.image_empty_description')}
                    </Typography>
                  </Box>

                  <Button
                    component="label"
                    disabled={disabled || isUploading}
                    startIcon={<Icon name="upload" size={16} />}
                    sx={{
                      mt: 1,
                      minHeight: 36,
                      px: 2,
                      borderRadius: 1,
                      bgcolor: 'text.primary',
                      color: 'background.paper',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'text.secondary',
                      },
                      '&.Mui-disabled': {
                        color: 'action.disabled',
                        bgcolor: 'action.disabledBackground',
                      },
                    }}
                  >
                    {isUploading
                      ? t('form.upload.uploading')
                      : (uploadButtonLabel ?? t('form.upload.upload_image'))}

                    <input
                      hidden
                      id={inputId}
                      type="file"
                      accept={accept}
                      aria-label={toDisplayText(label ?? t('form.upload.upload_image'))}
                      onChange={handleChange}
                    />
                  </Button>
                </Box>
              )}

              {hasImage && (
                <Box
                  sx={(theme) => ({
                    p: 2,
                    gap: 2,
                    minWidth: 0,
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    border: `1px solid ${fieldState.error ? theme.palette.error.main : theme.palette.divider}`,
                    bgcolor: 'background.paper',
                  })}
                >
                  <Box
                    component="img"
                    src={localPreviewUrl ?? fileData?.url ?? undefined}
                    alt={fileData?.originalName ?? t('form.upload.image_preview_alt')}
                    sx={{
                      width: { xs: '100%', sm: 132 },
                      height: { xs: 180, sm: 132 },
                      flexShrink: 0,
                      display: 'block',
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    {fileData ? (
                      <>
                        <Typography
                          title={fileData.originalName}
                          sx={{
                            fontSize: portalFontSize(14),
                            fontWeight: 700,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {fileData.originalName}
                        </Typography>

                        <Box
                          component="dl"
                          sx={{
                            m: 0,
                            mt: 1.25,
                            display: 'grid',
                            rowGap: 0.5,
                            columnGap: 1.5,
                            gridTemplateColumns: 'auto minmax(0, 1fr)',
                          }}
                        >
                          {imageMetadata.map((item) => (
                            <Box key={item.label} component="div" sx={{ display: 'contents' }}>
                              <Typography
                                component="dt"
                                sx={{ fontSize: portalFontSize(12), color: 'text.secondary' }}
                              >
                                {item.label}
                              </Typography>

                              <Typography
                                component="dd"
                                title={item.value}
                                sx={{
                                  m: 0,
                                  minWidth: 0,
                                  fontSize: portalFontSize(12),
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: portalFontSize(13), color: 'text.secondary' }}>
                        {t('form.upload.local_image_selected')}
                      </Typography>
                    )}

                    <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {fileData && (
                        <IconButton
                          icon="eye"
                          toolTip={t('form.upload.view_image')}
                          iconSize={17}
                          size="small"
                          disabled={disabled || isUploading}
                          onClick={handleView}
                          sx={{ color: 'text.secondary' }}
                        />
                      )}

                      {fileData && (
                        <IconButton
                          icon="download"
                          toolTip={t('form.upload.download_image')}
                          iconSize={17}
                          size="small"
                          disabled={disabled || isUploading}
                          onClick={handleDownload}
                          sx={{ color: 'text.secondary' }}
                        />
                      )}

                      <IconButton
                        icon="trash"
                        toolTip={t('form.upload.remove_image')}
                        iconSize={17}
                        size="small"
                        disabled={disabled || isUploading}
                        onClick={handleDelete}
                        sx={{ color: 'text.secondary' }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {(isLoadingSavedFile || hasLoadError) && (
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: portalFontSize(12),
                  color: hasLoadError ? 'error.main' : 'text.secondary',
                }}
              >
                {hasLoadError ? t('form.upload.image_load_error') : t('form.upload.loading_image')}
              </Typography>
            )}

            {(fieldState.error?.message || helperText) && (
              <FormHelperText sx={{ mr: 0, ml: 0.5 }}>
                {fieldState.error?.message ?? helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

const getValidFileId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }

  return null;
};

type FormImageUploadState = {
  fileData: FileResponse | null;
  localPreviewUrl: string | null;
};

type FormImageUploadAction =
  | { type: 'reset' }
  | { type: 'setLocalPreviewUrl'; localPreviewUrl: string | null }
  | { type: 'setFileData'; fileData: FileResponse | null; clearLocalPreviewUrl?: boolean };

const formImageUploadReducer = (
  state: FormImageUploadState,
  action: FormImageUploadAction,
): FormImageUploadState => {
  switch (action.type) {
    case 'reset':
      return {
        fileData: null,
        localPreviewUrl: null,
      };

    case 'setLocalPreviewUrl':
      return {
        ...state,
        localPreviewUrl: action.localPreviewUrl,
      };

    case 'setFileData':
      return {
        fileData: action.fileData,
        localPreviewUrl: action.clearLocalPreviewUrl ? null : state.localPreviewUrl,
      };

    default:
      return state;
  }
};
