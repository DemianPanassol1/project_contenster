import type { PaginateRequest } from '@contenster/shared';

const MAX_ACCESS_MODELS_PER_PAGE = 1000;

export const accessModelListRequest: PaginateRequest = {
  isOptional: false,
  pagination: {
    filters: [],
    page: 1,
    perPage: MAX_ACCESS_MODELS_PER_PAGE,
    sort: [],
  },
};

export function filterAccessModelsByText<T extends { description: string | null; name: string }>(
  models: T[],
  search: string,
): T[] {
  const normalizedSearch = search.trim().toLocaleLowerCase();

  if (!normalizedSearch) {
    return models;
  }

  return models.filter((model) =>
    [model.name, model.description]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch)),
  );
}
