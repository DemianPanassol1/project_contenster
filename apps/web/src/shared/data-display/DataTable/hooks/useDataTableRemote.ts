'use client';

import { useCallback, useMemo, useState } from 'react';

import { usePOST } from '@/services/hooks';

import { type PaginatedBody, toApiFilters, toApiSort } from '../types/data-table-query.types';
import type { DataTableState, UseDataTableRemoteParams } from '../types/DataTable.types';

export const useDataTableRemote = <T extends object>({
  endpoint,
  initialPage = 1,
  initialPerPage = 10,
  initialSortBy = [],
  initialFilters = [],
  revalidate = false,
}: UseDataTableRemoteParams<T>): DataTableState<T> => {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [filters, setFilters] = useState(initialFilters);

  const body = useMemo(
    () => ({
      pagination: {
        page,
        perPage,
        sort: toApiSort(sortBy),
        filters: toApiFilters(filters),
      },
    }),
    [filters, page, perPage, sortBy],
  );

  const response = usePOST<PaginatedBody<T>>(endpoint, body, revalidate);
  const data = response.data?.success ? response.data.body : null;
  const handleSetPerPage = useCallback((nextPerPage: number) => {
    setPerPage(nextPerPage);
    setPage(1);
  }, []);
  const handleSetSortBy = useCallback((nextSortBy: typeof sortBy) => {
    setSortBy(nextSortBy);
    setPage(1);
  }, []);
  const handleSetFilters = useCallback((nextFilters: typeof filters) => {
    setFilters(nextFilters);
    setPage(1);
  }, []);

  return {
    rows: data?.items ?? [],
    loading: response.isLoading,
    meta: data?.meta,
    page,
    perPage,
    sortBy,
    filters,
    setPage,
    setPerPage: handleSetPerPage,
    setSortBy: handleSetSortBy,
    setFilters: handleSetFilters,
    refresh: response.refresh,
  };
};
