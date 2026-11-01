'use client';

import { Box, Stack, Tab, Tabs } from '@mui/material';
import { AppWindow, Globe2, MonitorSmartphone, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalSplitMediaPosition,
  type SessionLanguage,
} from '@contenster/shared';
import { portalFontSize } from '@/core/theme';
import { useValidationRules } from '@/hooks';
import { FormInput, FormSelect, TranslationsFields } from '@/shared';

import type { PortalFormTab, PortalFormValues } from '../types/portal-form.types';

import { PortalDomainsEditor } from './PortalDomainsEditor';
import { PortalFormSection } from './PortalFormSection';
import { PortalIdentityFields } from './PortalIdentityFields';
import { PortalMediaFields } from './PortalMediaFields';

const tabs: Array<{ icon: typeof AppWindow; value: PortalFormTab }> = [
  { icon: AppWindow, value: 'general' },
  { icon: Globe2, value: 'domains' },
  { icon: Palette, value: 'identity' },
  { icon: MonitorSmartphone, value: 'login' },
];

function PortalTabPanel({
  activeTab,
  children,
  tab,
}: {
  activeTab: PortalFormTab;
  children: ReactNode;
  tab: PortalFormTab;
}) {
  return (
    <Box
      hidden={activeTab !== tab}
      role="tabpanel"
      sx={{ display: activeTab === tab ? 'block' : 'none', p: 2 }}
    >
      {children}
    </Box>
  );
}

export function PortalForm({ languages }: { languages: SessionLanguage[] }) {
  const t = useTranslations('protected.system_admin.portals');
  const { createValidationRules } = useValidationRules<PortalFormValues>();
  const { control } = useFormContext<PortalFormValues>();
  const [activeTab, setActiveTab] = useState<PortalFormTab>('general');
  const loginHeaderMode = useWatch({ control, name: 'loginHeaderMode' });
  const loginLayout = useWatch({ control, name: 'loginLayout' });

  return (
    <Stack>
      <Tabs
        aria-label={t('tabs.label')}
        value={activeTab}
        variant="scrollable"
        onChange={(_, value: PortalFormTab) => setActiveTab(value)}
        sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 44, px: 1 }}
      >
        {tabs.map(({ icon: TabIcon, value }) => (
          <Tab
            key={value}
            icon={<TabIcon size={16} />}
            iconPosition="start"
            label={t(`tabs.${value}`)}
            value={value}
            sx={{
              fontSize: portalFontSize(12.5),
              minHeight: 44,
              textTransform: 'none',
              '& .MuiTab-iconWrapper': { mb: '0 !important', mr: 0.75 },
            }}
          />
        ))}
      </Tabs>

      <PortalTabPanel activeTab={activeTab} tab="general">
        <Stack spacing={3}>
          <PortalFormSection
            description={t('general.administrative_description')}
            title={t('general.administrative_title')}
          >
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
              }}
            >
              <FormInput<PortalFormValues>
                helperText={t('helpers.internal_name')}
                label={t('fields.internal_name')}
                name="internalName"
                required
                rules={createValidationRules('required|max_length[100]')}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
              <FormInput<PortalFormValues>
                helperText={t('helpers.support_url')}
                label={t('fields.support_url')}
                name="supportUrl"
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
            </Box>
          </PortalFormSection>

          <PortalFormSection
            description={t('general.translations_description')}
            title={t('general.translations_title')}
          >
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
              }}
            >
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.application_name')}
                label={t('fields.application_name')}
                languages={languages}
                name="translations"
                textProperty="applicationName"
                validations="max_length[150]"
              />
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.login_title')}
                label={t('fields.login_title')}
                languages={languages}
                name="translations"
                textProperty="loginTitle"
                validations="max_length[150]"
              />
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.application_description')}
                label={t('fields.application_description')}
                languages={languages}
                name="translations"
                textProperty="applicationDescription"
                type="textarea"
                maxLength={500}
              />
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.login_description')}
                label={t('fields.login_description')}
                languages={languages}
                name="translations"
                textProperty="loginDescription"
                type="textarea"
                maxLength={500}
              />
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.support_text')}
                label={t('fields.support_text')}
                languages={languages}
                name="translations"
                textProperty="supportText"
                validations="max_length[250]"
              />
              <TranslationsFields<PortalFormValues>
                helperText={t('helpers.brand_asset_alt')}
                label={t('fields.brand_asset_alt')}
                languages={languages}
                name="translations"
                rules={{
                  validate: (value) =>
                    loginHeaderMode !== PortalLoginHeaderMode.brandAsset ||
                    Boolean(value) ||
                    t('validation.brand_asset_alt_required'),
                }}
                textProperty="loginBrandAssetAlt"
                validations="max_length[250]"
              />
            </Box>
          </PortalFormSection>
        </Stack>
      </PortalTabPanel>

      <PortalTabPanel activeTab={activeTab} tab="domains">
        <PortalDomainsEditor />
      </PortalTabPanel>

      <PortalTabPanel activeTab={activeTab} tab="identity">
        <PortalIdentityFields />
      </PortalTabPanel>

      <PortalTabPanel activeTab={activeTab} tab="login">
        <Stack spacing={3}>
          <PortalFormSection
            description={t('login.configuration_description')}
            title={t('login.configuration_title')}
          >
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))', xs: '1fr' },
              }}
            >
              <FormSelect<PortalFormValues>
                helperText={t('helpers.login_layout')}
                label={t('fields.login_layout')}
                name="loginLayout"
                options={Object.values(PortalLoginLayout).map((value) => ({
                  label: t(`values.login_layout.${value}`),
                  value,
                }))}
                rules={{ required: t('validation.login_layout_required') }}
                textFieldProps={{ required: true }}
              />
              {loginLayout === PortalLoginLayout.split && (
                <FormSelect<PortalFormValues>
                  helperText={t('helpers.split_media_position')}
                  label={t('fields.split_media_position')}
                  name="splitMediaPosition"
                  options={Object.values(PortalSplitMediaPosition).map((value) => ({
                    label: t(`values.split_position.${value}`),
                    value,
                  }))}
                  rules={{ required: t('validation.split_position_required') }}
                  textFieldProps={{ required: true }}
                />
              )}
              <FormSelect<PortalFormValues>
                helperText={t('helpers.login_header_mode')}
                label={t('fields.login_header_mode')}
                name="loginHeaderMode"
                options={Object.values(PortalLoginHeaderMode).map((value) => ({
                  label: t(`values.header_mode.${value}`),
                  value,
                }))}
                rules={{ required: t('validation.login_header_mode_required') }}
                textFieldProps={{ required: true }}
              />
            </Box>
          </PortalFormSection>
          <PortalFormSection
            description={t('login.media_description')}
            title={t('login.media_title')}
          >
            <PortalMediaFields />
          </PortalFormSection>
        </Stack>
      </PortalTabPanel>
    </Stack>
  );
}
