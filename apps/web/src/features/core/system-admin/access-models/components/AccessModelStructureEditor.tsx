'use client';

import type {
  SaveAccessModelRequest as AccessModelFormValues,
  SessionLanguage as SettingsLanguage,
} from '@contenster/shared';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/shared';

import { createAccessModelModule, createAccessModelModuleKey } from '../utils/access-model.utils';

import { AccessModelModuleEditor } from './AccessModelModuleEditor';
import { AccessModelSortableItem } from './AccessModelSortableItem';

interface AccessModelStructureEditorProps {
  languages: SettingsLanguage[];
  initiallyExpandFirstModule?: boolean;
}

export const AccessModelStructureEditor = ({
  languages,
  initiallyExpandFirstModule = false,
}: AccessModelStructureEditorProps) => {
  const t = useTranslations('protected.access_models');
  const dragContextId = useId();

  const { control, getValues, setValue } = useFormContext<AccessModelFormValues>();

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [isInitialModuleExpanded, setIsInitialModuleExpanded] = useState(
    initiallyExpandFirstModule,
  );

  const shouldExpandAppendedModule = useRef(false);

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: 'structure.modules',
    keyName: 'fieldId',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!shouldExpandAppendedModule.current || !fields.length) {
      return;
    }

    setExpandedModuleId(fields.at(-1)?.fieldId ?? null);
    shouldExpandAppendedModule.current = false;
  }, [fields]);

  useEffect(() => {
    const modules = getValues('structure.modules');
    const keys = new Set(modules.flatMap((module) => (module.key === null ? [] : [module.key])));

    modules.forEach((module, index) => {
      if (module.key !== null) {
        return;
      }

      const key = createAccessModelModuleKey(keys);

      keys.add(key);
      setValue(`structure.modules.${index}.key`, key, { shouldDirty: false });
    });
  }, [fields, getValues, setValue]);

  const addModule = () => {
    const keys = new Set(
      getValues('structure.modules').flatMap((module) => (module.key === null ? [] : [module.key])),
    );

    setIsInitialModuleExpanded(false);
    shouldExpandAppendedModule.current = true;
    append(createAccessModelModule(languages, fields.length, createAccessModelModuleKey(keys)));
  };

  const reorderModules = useCallback(
    (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
      const activeIndex = fields.findIndex((field) => field.fieldId === activeId);
      const overIndex = fields.findIndex((field) => field.fieldId === overId);

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return;
      }

      if (isInitialModuleExpanded) {
        setExpandedModuleId(fields[0]?.fieldId ?? null);
        setIsInitialModuleExpanded(false);
      }

      move(activeIndex, overIndex);

      fields.forEach((_, index) => {
        setValue(`structure.modules.${index}.order`, index, { shouldDirty: true });
      });
    },
    [fields, isInitialModuleExpanded, move, setValue],
  );

  const removeModule = (index: number) => {
    const removedFieldId = fields[index]?.fieldId;
    const remainingCount = getValues('structure.modules').length - 1;

    remove(index);

    for (let currentIndex = 0; currentIndex < remainingCount; currentIndex += 1) {
      setValue(`structure.modules.${currentIndex}.order`, currentIndex, { shouldDirty: true });
    }

    if (removedFieldId === expandedModuleId) {
      setExpandedModuleId(null);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: '1.5rem 2rem', gridColumn: '1 / -1' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem 2rem',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('structure')}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          icon="plus"
          label={t('create_module')}
          onClick={addModule}
        />
      </Box>

      <DndContext
        id={dragContextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={({ active, over }) => {
          if (over) {
            reorderModules(active.id, over.id);
          }
        }}
      >
        <SortableContext
          items={fields.map((field) => field.fieldId)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {fields.map((field, moduleIndex) => (
              <AccessModelSortableItem key={field.fieldId} id={field.fieldId}>
                {(moduleDragHandle) => (
                  <AccessModelModuleEditor
                    moduleIndex={moduleIndex}
                    languages={languages}
                    dragHandle={moduleDragHandle}
                    canRemove={fields.length > 1}
                    expanded={
                      isInitialModuleExpanded
                        ? moduleIndex === 0
                        : expandedModuleId === field.fieldId
                    }
                    onExpandedChange={(isExpanded) => {
                      setIsInitialModuleExpanded(false);
                      setExpandedModuleId(isExpanded ? field.fieldId : null);
                    }}
                    onRemove={() => removeModule(moduleIndex)}
                  />
                )}
              </AccessModelSortableItem>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};
