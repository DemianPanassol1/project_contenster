'use client';

import { useTranslations } from 'next-intl';

import { DocumentType, type GetClientByIdResponse } from '@contenster/shared';
import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { ClientForm } from '../components/ClientForm';
import type { ClientFormValues } from '../types/client-form.types';
import { getClientDefaultValues, mapClientContent, mapClientPayload } from '../utils/client.utils';

const CLIENT_FORM_ID = 'client-form';

export function ClientView({ presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.clients');
  const router = useRouter();
  const { apiRequest } = useGlobalContext();

  return (
    <Page
      actions={
        <Button
          form={CLIENT_FORM_ID}
          icon="save"
          iconPosition="start"
          label={t('save')}
          type="submit"
        />
      }
      description={presentation.description ?? undefined}
      functionality={presentation.functionalityName}
      module={presentation.moduleName}
    >
      <FormWrapper<ClientFormValues>
        contentUrl={API_ROUTES.ADMIN.GET_CURRENT_CLIENT}
        fields={getClientDefaultValues()}
        id={CLIENT_FORM_ID}
        mapContent={(content) => mapClientContent(content as GetClientByIdResponse)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetClientByIdResponse>({
              body: mapClientPayload(values),
              endpoint: API_ROUTES.ADMIN.POST_CLIENT,
              method: 'POST',
              onSuccess: () => router.refresh(),
            })
          ).success
        }
      >
        {({ watch }) => <ClientForm documentType={watch('documentType') ?? DocumentType.cnpj} />}
      </FormWrapper>
    </Page>
  );
}
