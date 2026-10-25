import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { type CrudTableRowId, isSameRowId } from '../utils/crud-table.util';

interface UseCrudTableSortableParams<TRow extends FieldValues> {
  rows: TRow[];
  getRowId: (row: TRow) => CrudTableRowId;
  onReorder: (activeId: CrudTableRowId, overId: CrudTableRowId) => void;
}

export const useCrudTableSortable = <TRow extends FieldValues>({
  rows,
  getRowId,
  onReorder,
}: UseCrudTableSortableParams<TRow>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const items = useMemo<UniqueIdentifier[]>(
    () => rows.map((row) => getRowId(row)),
    [getRowId, rows],
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || isSameRowId(active.id, over.id)) {
        return;
      }

      onReorder(active.id, over.id);
    },
    [onReorder],
  );

  return {
    items,
    sensors,
    handleDragEnd,
  };
};
