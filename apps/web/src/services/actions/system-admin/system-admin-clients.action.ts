'use server';

import type { PaginatedBody, SystemAdminClientListItem } from '@contenster/shared';

import type { Locale } from '@/i18n/routing';
import { API_ROUTES } from '@/routes';
import { apiInstance } from '@/services/api-instance.service';
import type { FetchOptionsResponse, SelectOption } from '@/services/hooks';

const MAX_CLIENTS_PER_PAGE = 1000;

export const getSystemAdminClientOptions = async (
  locale: Locale,
): Promise<FetchOptionsResponse> => {
  const response = await apiInstance.post<PaginatedBody<SystemAdminClientListItem>>(
    API_ROUTES.SYSTEM_ADMIN.POST_CLIENT_LIST,
    {
      body: {
        isOptional: false,
        pagination: {
          filters: [
            {
              disjunctive: false,
              field: 'isActive',
              operator: 'equals',
              type: 'boolean',
              value: true,
            },
          ],
          page: 1,
          perPage: MAX_CLIENTS_PER_PAGE,
          sort: [{ direction: 'asc', field: 'tradeName' }],
        },
      },
      locale,
    },
  );

  if (!response.success || !response.body) {
    return [];
  }

  return response.body.items.map<SelectOption>((client) => ({
    label: client.tradeName,
    metadata: {
      document: client.document,
      documentType: client.documentType,
    },
    value: client.id,
  }));
};
