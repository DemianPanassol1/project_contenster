'use client';

import type {
  AccessModelFunctionalityDefinition as AccessModelFunctionality,
  SaveAccessModelRequest as AccessModelFormValues,
  SessionLanguage as SettingsLanguage,
} from '@contenster/shared';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormHelperText,
  IconButton,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { useValidationRules } from '@/hooks';
import { FormCheckbox, FormIconSelect, FormSelect, Icon, TranslationsFields } from '@/shared';

import { useAccessModelFunctionalityOptions } from '../hooks/useAccessModelFunctionalityOptions';
import { getAccessModelLocalizedName } from '../utils/access-model.utils';

interface AccessModelFunctionalityEditorProps {
  moduleIndex: number;
  functionalityIndex: number;
  languages: SettingsLanguage[];
  functionalities: AccessModelFunctionality[];
  dragHandle: ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onRemove: () => void;
}

type AccessModelFunctionalityFieldBase = `structure.modules.${number}.functionalities.${number}`;

interface AccessModelFunctionalityTitleProps {
  fieldBase: AccessModelFunctionalityFieldBase;
}

const AccessModelFunctionalityTitle = ({ fieldBase }: AccessModelFunctionalityTitleProps) => {
  const t = useTranslations('protected.access_models');
  const locale = useLocale();

  const { control } = useFormContext<AccessModelFormValues>();

  const localizedName = useWatch({
    control,
    name: `${fieldBase}.translations`,
    compute: (translations) => getAccessModelLocalizedName(translations, locale),
  });
  const slug = useWatch({ control, name: `${fieldBase}.slug`, exact: true });

  const functionalityTitle = localizedName || slug || t('create_functionality');

  return (
    <Typography sx={{ minWidth: 0, flex: 1, fontSize: portalFontSize(14), fontWeight: 700 }} noWrap>
      {functionalityTitle}
    </Typography>
  );
};

export const AccessModelFunctionalityEditor = ({
  moduleIndex,
  functionalityIndex,
  languages,
  functionalities,
  dragHandle,
  expanded,
  onExpandedChange,
  onRemove,
}: AccessModelFunctionalityEditorProps) => {
  const t = useTranslations('protected.access_models');
  const locale = useLocale();

  const { createValidationRules } = useValidationRules<AccessModelFormValues>();

  const fieldBase =
    `structure.modules.${moduleIndex}.functionalities.${functionalityIndex}` as const;
  const slug = functionalities[functionalityIndex]?.slug ?? '';
  const { control, setValue } = useFormContext<AccessModelFormValues>();
  const modules = useWatch({ control, name: 'structure.modules' });
  const enabledLanguageCodes =
    useWatch({ control, name: `${fieldBase}.enabledLanguageCodes` }) ?? [];
  const enabledLanguages = languages.filter((language) =>
    enabledLanguageCodes.includes(language.locale),
  );

  const { languageOptions, parentOptions, slugOptions } = useAccessModelFunctionalityOptions({
    functionalities,
    modules,
    languages,
    locale,
    slug,
  });

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      disableGutters
      elevation={0}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: '10px !important',
        bgcolor: 'background.paper',
        '&::before': { display: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.5, md: 2 },
          bgcolor: 'action.hover',
        }}
      >
        {dragHandle}
        <AccordionSummary
          expandIcon={<Icon name="arrow-right" size={16} />}
          sx={{
            minWidth: 0,
            minHeight: 50,
            flex: 1,
            px: 0,
            '& .MuiAccordionSummary-content': { my: 1, minWidth: 0 },
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(90deg)',
            },
          }}
        >
          <AccessModelFunctionalityTitle fieldBase={fieldBase} />
        </AccordionSummary>
        <IconButton
          size="small"
          color="error"
          aria-label={t('delete_functionality')}
          onClick={onRemove}
        >
          <Icon name="trash" size={17} />
        </IconButton>
      </Box>

      <AccordionDetails
        sx={{
          p: { xs: 1.5, md: 2 },
          display: 'grid',
          gap: '1.5rem 1rem',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <TranslationsFields<AccessModelFormValues>
          languages={enabledLanguages}
          name={`${fieldBase}.translations`}
          textProperty="name"
          label={t('name')}
          rules={createValidationRules('required|max_length[75]')}
        />
        <Box sx={{ display: 'grid', gap: '1.5rem 1rem', gridTemplateColumns: '1fr 1fr' }}>
          <FormSelect<AccessModelFormValues>
            name={`${fieldBase}.slug`}
            label={t('functionality')}
            options={slugOptions}
            rules={createValidationRules('required')}
            onValueChange={(value) => {
              if (typeof value !== 'string') {
                return;
              }
              functionalities.forEach((item, index) => {
                if (item.parentSlug === slug && slug) {
                  setValue(
                    `structure.modules.${moduleIndex}.functionalities.${index}.parentSlug`,
                    value,
                    { shouldDirty: true },
                  );
                }
              });
            }}
          />
          <FormSelect<AccessModelFormValues>
            name={`${fieldBase}.parentSlug`}
            label={t('parent')}
            options={parentOptions}
            textFieldProps={{ placeholder: t('no_parent') }}
          />
        </Box>
        <TranslationsFields<AccessModelFormValues>
          type="textarea"
          languages={enabledLanguages}
          name={`${fieldBase}.translations`}
          textProperty="description"
          label={t('description')}
          rules={createValidationRules('max_length[255]')}
        />
        <Box sx={{ display: 'grid', gap: '1.5rem 1rem' }}>
          <FormIconSelect<AccessModelFormValues>
            name={`${fieldBase}.icon`}
            label={t('icon')}
            rules={createValidationRules('max_length[100]')}
          />
          <FormSelect<AccessModelFormValues>
            multiple
            name={`${fieldBase}.enabledLanguageCodes`}
            label={t('enabled_languages')}
            options={languageOptions}
            rules={createValidationRules('required')}
          />
        </Box>
        <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
          <FormCheckbox<AccessModelFormValues> name={`${fieldBase}.isActive`} label={t('active')} />
          <FormCheckbox<AccessModelFormValues>
            name={`${fieldBase}.isNavigationGroup`}
            label={t('navigation_group')}
          />
          <FormHelperText
            sx={{ color: 'text.secondary', fontSize: portalFontSize(12), m: '3px 0 4px' }}
          >
            {t('navigation_group_helper')}
          </FormHelperText>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
