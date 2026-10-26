'use client';

import type { SaveSystemModuleRequest, SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { FormInput, FormSwitch, TranslationsFields } from '@/shared';

interface SystemModuleFormProps {
  languages: SessionLanguage[];
}

export function SystemModuleForm({ languages }: SystemModuleFormProps) {
  const t = useTranslations('protected.modules');
  const { createValidationRules } = useValidationRules<SaveSystemModuleRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: {
          xs: 'auto',
          md: '1fr 1fr',
        },
      }}
    >
      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <TranslationsFields<SaveSystemModuleRequest>
          label={t('name')}
          languages={languages}
          name="translations"
          rules={createValidationRules('required')}
          textProperty="name"
        />
      </Box>

      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <TranslationsFields<SaveSystemModuleRequest>
          label={t('description')}
          languages={languages}
          name="translations"
          textProperty="description"
          type="textarea"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gridColumn: { md: '1 / -1' },
        }}
      >
        <FormInput<SaveSystemModuleRequest>
          label={t('order')}
          name="order"
          rules={createValidationRules('required|integer')}
          slotProps={{ htmlInput: { step: 1 } }}
          type="number"
        />

        <Box sx={{ alignSelf: 'center' }}>
          <FormSwitch<SaveSystemModuleRequest> label={t('is_active')} name="isActive" />
        </Box>
      </Box>
    </Box>
  );
}
