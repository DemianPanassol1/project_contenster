'use client';

import { Box, Button, FormControl, FormHelperText, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { type ChangeEvent, useEffect, useId, useReducer, useState } from 'react';
import { Controller, type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import { useGlobalContext } from '@/core/providers';
import { useGET } from '@/services/hooks';
import { getMediaFileEndpoint, uploadMediaFile } from '@/services/media';
import { Icon, IconButton } from '@/shared/ui';
import { type BaseFormFieldProps, type UploadFieldFile } from '@/types';
import { FormatUtils, toDisplayText } from '@/utils';

interface FormFileUploadProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string;
  disabled?: boolean;
  onDelete?: () => void;
  initialFile?: UploadFieldFile | null;
  uploadEndpoint?: string;
  onUploadSuccess?: (file: UploadFieldFile) => void;
}

export const FormFileUpload = <T extends FieldValues>({
  name,
  rules,
  label,
  onDelete,
  helperText,
  onUploadSuccess,
  uploadEndpoint,
  accept = '*',
  disabled = false,
  initialFile = null,
}: FormFileUploadProps<T>) => {
  const t = useTranslations();
  const locale = useLocale();
  const { control } = useFormContext<T>();
  const { apiRequest } = useGlobalContext();

  const inputId = useId();
  const fieldValue = useWatch({ control, name });

  const [{ fileData, selectedFileName }, dispatchUploadState] = useReducer(formFileUploadReducer, {
    fileData: initialFile,
    selectedFileName: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const fileId = getValidFileId(fieldValue);
  const shouldLoadFile = Boolean(fileId && fileData?.id !== fileId && !isUploading);
  const savedFileEndpoint = shouldLoadFile && fileId ? getMediaFileEndpoint(fileId) : null;
  const savedFile = useGET<UploadFieldFile>(savedFileEndpoint);
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
        clearSelectedFileName: true,
      });
    }
  }, [fileId, savedFile.data]);

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

          dispatchUploadState({ type: 'setSelectedFileName', selectedFileName: file.name });

          try {
            setIsUploading(true);

            const uploadedFile = await uploadMediaFile(apiRequest, file, uploadEndpoint);

            if (!uploadedFile) return;

            dispatchUploadState({
              type: 'setFileData',
              fileData: uploadedFile,
              clearSelectedFileName: true,
            });
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

        const fileMeta = fileData
          ? [fileData.mimeType, FormatUtils.formatFileSize(fileData.size, locale)]
              .filter(Boolean)
              .join(' - ')
          : '';

        return (
          <FormControl fullWidth error={!!fieldState.error}>
            {label && (
              <Typography
                component="label"
                htmlFor={inputId}
                sx={{
                  mb: 0.75,
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: disabled ? 'text.disabled' : 'text.primary',
                }}
              >
                {label}
              </Typography>
            )}

            <Box
              sx={(theme) => ({
                width: '100%',
                minWidth: 0,
                p: 1.5,
                gap: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                border: `1px ${fileData ? 'solid' : 'dashed'} ${fieldState.error ? theme.palette.error.main : theme.palette.divider}`,
                bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                opacity: disabled ? 0.7 : 1,
              })}
            >
              <Button
                component="label"
                disabled={disabled || isUploading}
                startIcon={<Icon name="upload" size={16} />}
                sx={{
                  flexShrink: 0,
                  minHeight: 40,
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
                {isUploading ? t('form.upload.uploading') : t('form.upload.choose_file')}

                <input
                  hidden
                  id={inputId}
                  type="file"
                  accept={accept}
                  aria-label={toDisplayText(label ?? t('form.upload.choose_file'))}
                  onChange={handleChange}
                />
              </Button>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                {fileData ? (
                  <>
                    <Typography
                      title={fileData.originalName}
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {fileData.originalName}
                    </Typography>

                    {fileMeta && (
                      <Typography
                        title={fileMeta}
                        sx={{
                          mt: 0.25,
                          fontSize: 12,
                          color: 'text.secondary',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {fileMeta}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography
                    title={selectedFileName ?? undefined}
                    sx={{
                      fontSize: 13,
                      color: 'text.secondary',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedFileName ?? t('form.upload.no_file_selected')}
                  </Typography>
                )}
              </Box>

              {fileData && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <IconButton
                    icon="download"
                    toolTip={t('form.upload.download_file')}
                    iconSize={17}
                    size="small"
                    disabled={disabled || isUploading}
                    onClick={handleDownload}
                    sx={{ color: 'text.secondary' }}
                  />

                  <IconButton
                    icon="x"
                    toolTip={t('form.upload.remove_file')}
                    iconSize={17}
                    size="small"
                    disabled={disabled || isUploading}
                    onClick={handleDelete}
                    sx={{ color: 'text.secondary' }}
                  />
                </Box>
              )}
            </Box>

            {(isLoadingSavedFile || hasLoadError) && (
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 12,
                  color: hasLoadError ? 'error.main' : 'text.secondary',
                }}
              >
                {hasLoadError ? t('form.upload.file_load_error') : t('form.upload.loading_file')}
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

type FormFileUploadState = {
  fileData: UploadFieldFile | null;
  selectedFileName: string | null;
};

type FormFileUploadAction =
  | { type: 'reset' }
  | { type: 'setSelectedFileName'; selectedFileName: string | null }
  | { type: 'setFileData'; fileData: UploadFieldFile | null; clearSelectedFileName?: boolean };

const formFileUploadReducer = (
  state: FormFileUploadState,
  action: FormFileUploadAction,
): FormFileUploadState => {
  switch (action.type) {
    case 'reset':
      return {
        fileData: null,
        selectedFileName: null,
      };

    case 'setSelectedFileName':
      return {
        ...state,
        selectedFileName: action.selectedFileName,
      };

    case 'setFileData':
      return {
        fileData: action.fileData,
        selectedFileName: action.clearSelectedFileName ? null : state.selectedFileName,
      };

    default:
      return state;
  }
};
