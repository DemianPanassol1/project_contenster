import type { OptionRequest, PaginationMeta } from '@contenster/shared';

export const buildPaginationMeta = (request: OptionRequest, total: number): PaginationMeta => {
  const page = Math.max(1, request.pagination.page);
  const perPage = Math.max(1, request.pagination.perPage);

  return { page, perPage, total, totalPages: Math.ceil(total / perPage) };
};
