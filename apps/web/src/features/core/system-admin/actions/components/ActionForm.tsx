'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import {
  actionTypeDictionary,
  type SaveActionRequest,
  type SessionLanguage,
} from '@contenster/shared';
import { useValidationRules } from '@/hooks';
import { FormSelect, TranslationsFields } from '@/shared';

interface ActionFormProps {
  languages: SessionLanguage[];
}

export function ActionForm({ languages }: ActionFormProps) {
  const t = useTranslations('protected.actions');
  const tEnum = useTranslations();
  const { createValidationRules } = useValidationRules<SaveActionRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <TranslationsFields<SaveActionRequest>
        label={t('name')}
        languages={languages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        textProperty="name"
      />

      <FormSelect<SaveActionRequest>
        label={t('type')}
        name="type"
        options={Object.entries(actionTypeDictionary).map(([value, translationKey]) => ({
          label: tEnum(translationKey),
          value,
        }))}
        rules={createValidationRules('required')}
      />

      <TranslationsFields<SaveActionRequest>
        label={t('description')}
        languages={languages}
        name="translations"
        sx={{ gridColumn: { md: '1 / -1' } }}
        textProperty="description"
        type="textarea"
      />
    </Box>
  );
}
