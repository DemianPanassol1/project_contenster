'use client';

import { Paper, Table, TableContainer, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useGlobalContext, useModalContext } from '@/core/providers';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type OptionsSource, useOptionsCollection } from '@/services/hooks';
import { DEFAULT_PER_PAGE_OPTIONS } from '@/utils';

import { useDataTableLocal } from './hooks/useDataTableLocal';
import { useDataTableRemote } from './hooks/useDataTableRemote';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { type FilterOption, Order, type SortOption } from './types/data-table-query.types';
import type {
  DataTableAction,
  DataTableColumn,
  DataTableProps,
  DataTableState,
} from './types/DataTable.types';
import {
  buildCsv,
  buildSearchFilters,
  downloadCsv,
  getColumnKey,
  getColumnSelector,
  getDefaultRowId,
} from './utils/data-table.util';
import {
  AppliedFilterChips,
  DataTableBody,
  DataTableColumnsPanel,
  DataTableFilters,
  DataTableHeader,
  DataTablePagination,
  DataTableSelectionBar,
  DataTableToolbar,
} from './components';

const getDefaultEditPath = (pathname: string, rowId: string | number) => {
  const currentPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  const listPath = currentPath.replace(/\/create$/, '').replace(/\/update\/[^/]+$/, '');

  if (!listPath || listPath === '/') {
    return null;
  }

  return `${listPath}/update/${rowId}`;
};

export const DataTable = <T extends object>({
  columns,
  actions = [],
  endpoint,
  bulkDeleteEndpoint,
  canEdit = true,
  canDelete = true,
  canExport = true,
  deleteConfirmation,
  showRowEditAction = false,
  showRowDeleteAction = false,
  getRowEditPath,
  data = [],
  rows,
  loading,
  meta,
  page,
  perPage,
  sortBy,
  filters,
  initialPage = 1,
  initialPerPage = 10,
  initialSortBy = [],
  initialFilters = [],
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  getRowId,
  primaryAction,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onPageChange,
  onPerPageChange,
  onSortChange,
  onFiltersChange,
  onRefresh,
  onDeleteSuccess,
  rowComponent,
  rowLeadingCell = false,
  showPagination = true,
  emptyState,
}: DataTableProps<T>) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { apiRequest } = useGlobalContext();
  const { openModal, closeModal } = useModalContext();
  const isControlled = rows !== undefined;
  const shouldUseRemote = !isControlled && Boolean(endpoint);

  const remoteState = useDataTableRemote<T>({
    endpoint: shouldUseRemote ? endpoint : null,
    columns,
    initialPage,
    initialPerPage,
    initialSortBy,
    initialFilters,
  });
  const localState = useDataTableLocal<T>({
    data,
    columns,
    initialPage,
    initialPerPage,
    initialSortBy,
    initialFilters,
  });

  const fallbackState = shouldUseRemote ? remoteState : localState;
  const state: DataTableState<T> = {
    rows: rows ?? fallbackState.rows,
    loading: loading ?? fallbackState.loading,
    meta: meta ?? fallbackState.meta,
    page: page ?? fallbackState.page,
    perPage: perPage ?? fallbackState.perPage,
    sortBy: sortBy ?? fallbackState.sortBy,
    filters: filters ?? fallbackState.filters,
    setPage: onPageChange ?? fallbackState.setPage,
    setPerPage: onPerPageChange ?? fallbackState.setPerPage,
    setSortBy: onSortChange ?? fallbackState.setSortBy,
    setFilters: onFiltersChange ?? fallbackState.setFilters,
    refresh: onRefresh ?? fallbackState.refresh,
  };

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 450);
  const [excludedSearchFields, setExcludedSearchFields] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterOption[]>(initialFilters);
  const draftFiltersRef = useRef(draftFilters);
  const excludedSearchFieldsRef = useRef(excludedSearchFields);
  const setTableFiltersRef = useRef(state.setFilters);
  const hasSyncedDebouncedSearchRef = useRef(false);
  const initialHiddenColumnKeys = useMemo(
    () => columns.filter((column) => column.hidden).map(getColumnKey),
    [columns],
  );
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>(initialHiddenColumnKeys);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Array<string | number>>([]);
  const optionsSources = useMemo<OptionsSource[]>(
    () =>
      columns
        .filter((column) => column.filter?.options || column.filter?.optionsEndpoint)
        .map((column) => ({
          key: getColumnKey(column),
          options: column.filter?.options,
          optionsEndpoint: column.filter?.optionsEndpoint,
          optionsMethod: column.filter?.optionsMethod,
          optionsBody: column.filter?.optionsBody,
          revalidateOptions: column.filter?.revalidateOptions,
        })),
    [columns],
  );
  const resolvedOptions = useOptionsCollection(optionsSources);
  const resolvedColumns = useMemo<DataTableColumn<T>[]>(
    () =>
      columns.map((column) => {
        if (!column.filter) {
          return column;
        }

        return {
          ...column,
          filter: {
            ...column.filter,
            options: resolvedOptions.options[getColumnKey(column)] ?? column.filter.options,
            isLoadingOptions: Boolean(column.filter.optionsEndpoint && resolvedOptions.isLoading),
          },
        };
      }),
    [columns, resolvedOptions.isLoading, resolvedOptions.options],
  );

  const visibleColumns = useMemo(
    () => resolvedColumns.filter((column) => !hiddenColumnKeys.includes(getColumnKey(column))),
    [hiddenColumnKeys, resolvedColumns],
  );
  const canSearch = resolvedColumns.some((column) => column.searchable);
  const canDeleteRows = canDelete && Boolean(bulkDeleteEndpoint);
  const canExportRows = canExport;
  const canSelectRows = selectable && (canDeleteRows || canExportRows);
  const currentSelectedIds = selectedIds ?? internalSelectedIds;
  const totalItems = state.meta?.total ?? state.rows.length;
  const selectedRows = state.rows.filter((row, index) => {
    const rowId = getRowId ? getRowId(row) : getDefaultRowId(row, index);

    return currentSelectedIds.includes(rowId);
  });
  const allPageIds = state.rows.map((row, index) =>
    getRowId ? getRowId(row) : getDefaultRowId(row, index),
  );

  const emitSelection = (nextSelectedIds: Array<string | number>) => {
    setInternalSelectedIds(nextSelectedIds);
    onSelectionChange?.(nextSelectedIds);
  };

  useEffect(() => {
    draftFiltersRef.current = draftFilters;
  }, [draftFilters]);

  useEffect(() => {
    excludedSearchFieldsRef.current = excludedSearchFields;
  }, [excludedSearchFields]);

  const setTableFilters = state.setFilters;
  useEffect(() => {
    setTableFiltersRef.current = setTableFilters;
  }, [setTableFilters]);

  const getSearchFilters = (nextSearch: string, excludedFields: string[]) => {
    return buildSearchFilters(resolvedColumns, nextSearch).filter(
      (filter) => !excludedFields.includes(filter.field),
    );
  };

  const emitFilters = (
    manualFilters: FilterOption[],
    nextSearch: string,
    excludedFields: string[],
  ) => {
    setTableFilters([...manualFilters, ...getSearchFilters(nextSearch, excludedFields)]);
  };

  useEffect(() => {
    // The first debounce emission mirrors the initial empty search state and must not reset
    // external pagination/filter controllers before the user changes the search input.
    if (!hasSyncedDebouncedSearchRef.current) {
      hasSyncedDebouncedSearchRef.current = true;
      return;
    }

    const nextSearchFilters = buildSearchFilters(resolvedColumns, debouncedSearch).filter(
      (filter) => !excludedSearchFieldsRef.current.includes(filter.field),
    );

    setTableFiltersRef.current([...draftFiltersRef.current, ...nextSearchFilters]);
  }, [resolvedColumns, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setExcludedSearchFields([]);
  };

  const handleApplyFilters = (nextFilters: FilterOption[]) => {
    setDraftFilters(nextFilters);
    emitFilters(nextFilters, debouncedSearch, excludedSearchFields);
  };

  const handleSort = (column: DataTableColumn<T>) => {
    const selector = getColumnSelector(column);
    const currentSort = state.sortBy.find((item) => item.field === selector);

    if (currentSort?.order === Order.DESC) {
      state.setSortBy([]);
      return;
    }

    const nextSort: SortOption = {
      field: selector,
      order: currentSort?.order === Order.ASC ? Order.DESC : Order.ASC,
    };

    state.setSortBy([nextSort]);
  };

  const handleRefresh = () => {
    setSearch('');
    setExcludedSearchFields([]);
    setDraftFilters([]);
    setTableFilters([]);
    emitSelection([]);
    void state.refresh?.();
  };

  const handleExport = () => {
    downloadCsv(buildCsv(state.rows, visibleColumns));
  };

  const handleExportSelected = () => {
    downloadCsv(buildCsv(selectedRows, visibleColumns));
  };

  const executeDelete = (ids: Array<string | number>) => {
    if (!bulkDeleteEndpoint || !canDeleteRows) {
      return;
    }

    openModal({
      title: deleteConfirmation?.title ?? t('data_table.confirm_delete_title'),
      maxWidth: 'xs',
      content: (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {ids.length === 1
            ? (deleteConfirmation?.message ?? t('data_table.confirm_delete_single'))
            : (deleteConfirmation?.manyMessage ??
              deleteConfirmation?.message ??
              t('data_table.confirm_delete_many', { count: String(ids.length) }))}
        </Typography>
      ),
      actions: [
        {
          label: deleteConfirmation?.cancelLabel ?? t('form.cancel'),
          variant: 'text',
          closeOnClick: true,
        },
        {
          label:
            ids.length === 1
              ? (deleteConfirmation?.confirmLabel ?? t('data_table.delete'))
              : (deleteConfirmation?.manyConfirmLabel ??
                deleteConfirmation?.confirmLabel ??
                t('data_table.delete')),
          color: 'error',
          variant: 'contained',
          closeOnClick: false,
          onClick: async () => {
            await apiRequest({
              method: 'POST',
              endpoint: bulkDeleteEndpoint,
              body: ids.length === 1 ? { id: ids[0] } : { ids },
              onSuccess: () => {
                emitSelection([]);
                onDeleteSuccess?.(ids);
                void state.refresh?.();
                closeModal();
              },
            });
          },
        },
      ],
    });
  };

  const customRowActions = actions.filter(Boolean) as DataTableAction<T>[];
  const rowActions: DataTableAction<T>[] = [
    ...(showRowEditAction && canEdit
      ? [
          {
            label: t('form.edit'),
            icon: 'square-pen' as const,
            onClick: (row: T, rowId: string | number) => {
              const editPath = getRowEditPath?.(row, rowId) ?? getDefaultEditPath(pathname, rowId);

              if (!editPath) {
                return;
              }

              router.push(editPath);
            },
          },
        ]
      : []),
    ...customRowActions,
    ...(showRowDeleteAction && canDeleteRows
      ? [
          {
            label: deleteConfirmation?.confirmLabel ?? t('data_table.delete'),
            icon: 'trash' as const,
            color: 'error' as const,
            onClick: (_row: T, rowId: string | number) => executeDelete([rowId]),
          },
        ]
      : []),
  ];

  const searchFilters = useMemo(
    () =>
      buildSearchFilters(resolvedColumns, debouncedSearch).filter(
        (filter) => !excludedSearchFields.includes(filter.field),
      ),
    [resolvedColumns, debouncedSearch, excludedSearchFields],
  );
  const manualFilterChips = (
    <AppliedFilterChips
      columns={resolvedColumns}
      filters={draftFilters}
      onRemove={(filter) => {
        const nextDraftFilters = draftFilters.filter((item) => item !== filter);
        setDraftFilters(nextDraftFilters);
        setTableFilters([...nextDraftFilters, ...searchFilters]);
      }}
      onClearAll={() => {
        setDraftFilters([]);
        setTableFilters(searchFilters);
      }}
    />
  );
  const searchFilterChips = (
    <AppliedFilterChips
      columns={resolvedColumns}
      filters={searchFilters}
      fullWidth
      onRemove={(filter) => {
        const nextExcludedSearchFields = [...excludedSearchFields, filter.field];
        const nextSearchFilters = getSearchFilters(debouncedSearch, nextExcludedSearchFields);

        setExcludedSearchFields(nextExcludedSearchFields);
        setTableFilters([...draftFilters, ...nextSearchFilters]);
      }}
      onClearAll={() => {
        setSearch('');
        setExcludedSearchFields(searchFilters.map((filter) => filter.field));
        setTableFilters(draftFilters);
      }}
    />
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: 1.5,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <DataTableToolbar
        search={search}
        canSearch={canSearch}
        primaryAction={primaryAction}
        manualFilterChips={manualFilterChips}
        searchFilterChips={searchFilterChips}
        hasSearchFilterChips={searchFilters.length > 0}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        onExport={canExportRows && state.rows.length ? handleExport : undefined}
      >
        <DataTableFilters
          columns={resolvedColumns}
          activeFiltersCount={draftFilters.length}
          onApply={handleApplyFilters}
        />
        <DataTableColumnsPanel
          columns={resolvedColumns}
          hiddenColumnKeys={hiddenColumnKeys}
          initialHiddenColumnKeys={initialHiddenColumnKeys}
          selectable={canSelectRows}
          hasActions={Boolean(rowActions.length)}
          onHiddenColumnKeysChange={setHiddenColumnKeys}
        />
      </DataTableToolbar>

      <DataTableSelectionBar
        selectedCount={currentSelectedIds.length}
        selectedRowsCount={selectedRows.length}
        canDelete={canDeleteRows}
        canExport={canExportRows}
        onClearSelection={() => emitSelection([])}
        onExportSelected={handleExportSelected}
        onDeleteSelected={() => executeDelete(currentSelectedIds)}
        deleteLabel={deleteConfirmation?.selectionBarLabel}
      />

      <TableContainer
        sx={{
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table size="small">
          <DataTableHeader
            columns={visibleColumns}
            rowActionsCount={rowActions.length}
            selectable={canSelectRows}
            allPageIds={allPageIds}
            selectedIds={currentSelectedIds}
            sortBy={state.sortBy}
            rowLeadingCell={rowLeadingCell}
            onSelectionChange={emitSelection}
            onSort={handleSort}
          />

          <DataTableBody
            rows={state.rows}
            loading={state.loading}
            columns={visibleColumns}
            actions={rowActions}
            selectable={canSelectRows}
            selectedIds={currentSelectedIds}
            getRowId={getRowId}
            onSelectionChange={emitSelection}
            rowComponent={rowComponent}
            rowLeadingCell={rowLeadingCell}
            emptyState={emptyState}
          />
        </Table>
      </TableContainer>

      {showPagination && (
        <DataTablePagination
          page={state.page}
          perPage={state.perPage}
          totalItems={totalItems}
          perPageOptions={perPageOptions}
          onPageChange={state.setPage}
          onPerPageChange={state.setPerPage}
        />
      )}
    </Paper>
  );
};
