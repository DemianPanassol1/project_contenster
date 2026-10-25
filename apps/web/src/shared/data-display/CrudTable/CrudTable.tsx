'use client';

import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useId, useMemo } from 'react';
import type { DefaultValues, FieldValues } from 'react-hook-form';

import { useModalContext } from '@/core/providers';
import { useToast } from '@/hooks';
import {
  DataTable,
  type DataTableAction,
  type DataTableColumn,
} from '@/shared/data-display/DataTable';
import { Button } from '@/shared/ui/Button';

import { useCrudTableField } from './hooks/useCrudTableField';
import { useCrudTableSortable } from './hooks/useCrudTableSortable';
import type { CrudTableMode, CrudTableProps } from './types/crud-table.types';
import { cloneCrudTableRow, type CrudTableRowId, resolveDefaultRow } from './utils/crud-table.util';
import { CrudTableModalForm, SortableDataTableRow } from './components';

export const CrudTable = <TForm extends FieldValues, TRow extends FieldValues>({
  name,
  columns,
  getRowId,
  defaultRow,
  renderForm,
  canDeleteRow,
  actions = [],
  modal,
  tableProps,
  createLabel,
  editLabel,
  deleteLabel,
  deleteConfirmation,
  showCreateAction = true,
  showEditAction = true,
  showDeleteAction = true,
  sortable = false,
  sortableField,
}: CrudTableProps<TForm, TRow>) => {
  const t = useTranslations();
  const reactId = useId();
  const normalizedId = reactId.replaceAll(':', '');
  const modalFormId = `crud-table-${normalizedId}`;
  const sortableContextId = `crud-table-sortable-${normalizedId}`;
  const { errorMessage } = useToast();
  const { openModal, closeModal } = useModalContext();
  const currentSortableField = sortable ? sortableField : undefined;
  const { rows, createRow, updateRow, deleteRow, reorderRows } = useCrudTableField<TForm, TRow>({
    name,
    getRowId,
    sortableField: currentSortableField,
  });
  const sortableState = useCrudTableSortable<TRow>({
    rows,
    getRowId,
    onReorder: reorderRows,
  });
  const currentCreateLabel = createLabel ?? t('form.createRegister');
  const currentEditLabel = editLabel ?? t('form.edit');
  const currentDeleteLabel = deleteLabel ?? t('dataTable.delete');
  const isRowActionVisible = (
    visibility: boolean | ((row: TRow) => boolean),
    row: TRow,
  ): boolean => (typeof visibility === 'function' ? visibility(row) : visibility);

  const tableColumns = useMemo<DataTableColumn<TRow>[]>(() => {
    if (!sortable) {
      return columns;
    }

    return columns.map((column) => ({
      ...column,
      sortable: false,
      searchable: false,
      filterable: false,
    }));
  }, [columns, sortable]);

  const openCrudModal = (mode: CrudTableMode, row?: TRow, rowId?: CrudTableRowId) => {
    const fields = (
      mode === 'create' ? resolveDefaultRow(defaultRow) : cloneCrudTableRow(row as TRow)
    ) as DefaultValues<TRow>;
    const title =
      mode === 'create'
        ? (modal?.createTitle ?? currentCreateLabel)
        : (modal?.editTitle ?? currentEditLabel);
    let modalId = '';

    modalId = openModal({
      title,
      maxWidth: modal?.maxWidth ?? 'sm',
      fullWidth: modal?.fullWidth ?? true,
      disableClose: modal?.disableClose,
      content: (
        <CrudTableModalForm<TRow>
          formId={modalFormId}
          mode={mode}
          fields={fields}
          row={row}
          renderForm={renderForm}
          onSubmit={(content) => {
            if (mode === 'edit' && rowId !== undefined) {
              updateRow(rowId, content);
            } else {
              createRow(content);
            }

            closeModal(modalId);
          }}
        />
      ),
      actions: [
        {
          label: modal?.cancelLabel ?? t('form.cancel'),
          variant: 'text',
          closeOnClick: true,
        },
        {
          label: modal?.saveLabel ?? t('form.save'),
          type: 'submit',
          form: modalFormId,
          variant: 'contained',
          closeOnClick: false,
        },
      ],
    });
  };

  const customActions = actions.filter(Boolean) as DataTableAction<TRow>[];
  const handleDeleteRow = (row: TRow, rowId: CrudTableRowId) => {
    const canDelete = canDeleteRow?.(row, rows) ?? true;

    if (typeof canDelete === 'string') {
      errorMessage(canDelete);

      return;
    }

    if (!canDelete) {
      return;
    }

    deleteRow(rowId);
  };
  const rowActions: DataTableAction<TRow>[] = [
    ...(showEditAction
      ? [
          {
            label: currentEditLabel,
            icon: 'square-pen' as const,
            hidden: (row: TRow) => !isRowActionVisible(showEditAction, row),
            onClick: (row: TRow, rowId: string | number) => {
              openCrudModal('edit', cloneCrudTableRow(row), rowId);
            },
          },
        ]
      : []),
    ...customActions,
    ...(showDeleteAction
      ? [
          {
            label: currentDeleteLabel,
            icon: 'trash' as const,
            color: 'error' as const,
            hidden: (row: TRow) => !isRowActionVisible(showDeleteAction, row),
            confirm: deleteConfirmation ?? true,
            onClick: (row: TRow, rowId: string | number) => {
              handleDeleteRow(row, rowId);
            },
          },
        ]
      : []),
  ];
  const primaryAction = showCreateAction ? (
    <Button
      label={currentCreateLabel}
      icon="plus"
      iconPosition="start"
      onClick={() => openCrudModal('create')}
    />
  ) : null;
  const table = (
    <DataTable<TRow>
      {...tableProps}
      data={sortable ? [] : rows}
      rows={sortable ? rows : undefined}
      columns={tableColumns}
      actions={rowActions}
      getRowId={getRowId}
      primaryAction={primaryAction}
      rowComponent={sortable ? SortableDataTableRow<TRow> : undefined}
      rowLeadingCell={sortable}
      showPagination={!sortable}
    />
  );

  if (!sortable) {
    return table;
  }

  return (
    <DndContext
      id={sortableContextId}
      sensors={sortableState.sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={sortableState.handleDragEnd}
    >
      <SortableContext items={sortableState.items} strategy={verticalListSortingStrategy}>
        {table}
      </SortableContext>
    </DndContext>
  );
};
