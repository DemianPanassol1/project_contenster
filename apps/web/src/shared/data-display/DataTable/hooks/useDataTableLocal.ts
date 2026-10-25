'use client';

import { useCallback, useMemo, useState } from 'react';

import type { DataTableState, UseDataTableLocalParams } from '../types/DataTable.types';
import {
  buildLocalMeta,
  filterLocalRows,
  paginateLocalRows,
  sortLocalRows,
} from '../utils/data-table.util';

export const useDataTableLocal = <T extends object>({
  data,
  columns,
  initialPage = 1,
  initialPerPage = 10,
  initialSortBy = [],
  initialFilters = [],
}: UseDataTableLocalParams<T>): DataTableState<T> => {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [filters, setFilters] = useState(initialFilters);

  const filteredRows = useMemo(
    () => filterLocalRows(data, columns, filters),
    [columns, data, filters],
  );

  const sortedRows = useMemo(
    () => sortLocalRows(filteredRows, columns, sortBy),
    [columns, filteredRows, sortBy],
  );

  const rows = useMemo(
    () => paginateLocalRows(sortedRows, page, perPage),
    [page, perPage, sortedRows],
  );

  const meta = useMemo(
    () => buildLocalMeta(sortedRows.length, page, perPage, sortBy, filters),
    [filters, page, perPage, sortBy, sortedRows.length],
  );
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
    rows,
    loading: false,
    meta,
    page,
    perPage,
    sortBy,
    filters,
    setPage,
    setPerPage: handleSetPerPage,
    setSortBy: handleSetSortBy,
    setFilters: handleSetFilters,
  };
};
