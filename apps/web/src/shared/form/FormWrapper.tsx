'use client';

import { Alert, Box, Paper, Skeleton, Stack, type SxProps } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
  type UseFormGetValues,
  type UseFormReset,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';

import { useGET } from '@/services/hooks';

export interface FormWrapperChildrenProps<T extends FieldValues> {
  getValues: UseFormGetValues<T>;
  setValue: UseFormSetValue<T>;
  reset: UseFormReset<T>;
  watch: UseFormWatch<T>;
}

interface FormWrapperProps<T extends FieldValues> {
  fields: DefaultValues<T>;
  children: React.ReactNode | ((methods: FormWrapperChildrenProps<T>) => React.ReactNode);
  onSubmit: (content: T) => boolean | void | Promise<boolean | void>;
  id?: string;
  contentUrl?: string;
  contentErrorMessage?: string;
  requireContent?: boolean;
  showPaper?: boolean;
  mapContent?: (content: unknown) => DefaultValues<T>;
  onInvalid?: SubmitErrorHandler<T>;
  sx?: SxProps;
}

export const FormWrapper = <T extends FieldValues>({
  fields,
  children,
  onSubmit,
  contentUrl,
  contentErrorMessage,
  id = 'app-form',
  requireContent = true,
  showPaper = true,
  mapContent,
  onInvalid,
  sx,
}: FormWrapperProps<T>) => {
  const form = useForm<T>({
    defaultValues: fields,
  });
  const {
    reset,
    formState: { isDirty },
  } = form;

  const fetchData = useGET<T>(contentUrl);
  const mustLoadContent = Boolean(requireContent && contentUrl);
  const contentIsReady = Boolean(fetchData.data?.success && fetchData.data.body);
  const contentHasError = Boolean(fetchData.data && !fetchData.data.success);
  const [hydratedContentUrl, setHydratedContentUrl] = useState<string | null>(null);
  const contentIsHydrated = !mustLoadContent || hydratedContentUrl === contentUrl;
  const fieldsRef = useRef(fields);
  const mapContentRef = useRef(mapContent);
  const fieldsKey = getStableFormValueKey(fields);
  const shouldResetAfterSubmit = useRef(false);
  const markShouldResetAfterSubmit = useCallback(() => {
    shouldResetAfterSubmit.current = true;
  }, []);

  useEffect(() => {
    fieldsRef.current = fields;
    mapContentRef.current = mapContent;
  }, [fields, mapContent]);

  const handleOnSubmit: SubmitHandler<T> = async (content) => {
    const submitted = await onSubmit(content);

    if (contentUrl && submitted !== false) {
      markShouldResetAfterSubmit();
      void fetchData.refresh();
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (mustLoadContent && !contentIsReady) {
      event.preventDefault();
      return;
    }

    void form.handleSubmit(handleOnSubmit, onInvalid)(event);
  };

  useEffect(() => {
    if (
      contentUrl &&
      !fetchData.isLoading &&
      fetchData.data?.success &&
      fetchData.data.body &&
      (!isDirty || shouldResetAfterSubmit.current)
    ) {
      const content = fetchData.data.body;
      const currentMapContent = mapContentRef.current;

      reset(
        content && currentMapContent ? currentMapContent(content) : (content ?? fieldsRef.current),
      );
      setHydratedContentUrl(contentUrl);
      shouldResetAfterSubmit.current = false;
    }
  }, [contentUrl, fetchData.data, fetchData.isLoading, fieldsKey, isDirty, reset]);

  useEffect(() => {
    if (!contentUrl && !isDirty) {
      reset(fieldsRef.current);
    }
  }, [contentUrl, fieldsKey, isDirty, reset]);

  const renderedChildren =
    typeof children === 'function'
      ? children({
          getValues: form.getValues,
          setValue: form.setValue,
          reset: form.reset,
          watch: form.watch,
        })
      : children;

  const formBody =
    mustLoadContent && (!contentIsReady || !contentIsHydrated) ? (
      contentHasError ? (
        <Alert severity="error">
          {contentErrorMessage ?? fetchData.data?.errors.at(0)?.message}
        </Alert>
      ) : (
        <Stack spacing={1.5} aria-busy="true">
          <Skeleton width="35%" />
          <Skeleton height={48} />
          <Skeleton height={120} />
        </Stack>
      )
    ) : (
      renderedChildren
    );

  const content = (
    <Box id={id} noValidate component="form" onSubmit={handleFormSubmit}>
      {formBody}
    </Box>
  );

  return (
    <FormProvider {...form}>
      {showPaper ? (
        <Paper elevation={1} square={false} sx={{ px: 2, py: 3, ...sx }}>
          {content}
        </Paper>
      ) : (
        <Box sx={sx}>{content}</Box>
      )}
    </FormProvider>
  );
};

const getStableFormValueKey = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
