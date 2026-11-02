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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { useValidationRules } from '@/hooks';
import { Button, FormCheckbox, FormInput, Icon, TranslationsFields } from '@/shared';

import {
  createAccessModelFunctionality,
  getAccessModelLocalizedName,
} from '../utils/access-model.utils';

import { AccessModelFunctionalityEditor } from './AccessModelFunctionalityEditor';
import { AccessModelSortableItem } from './AccessModelSortableItem';

interface AccessModelModuleEditorProps {
  moduleIndex: number;
  languages: SettingsLanguage[];
  dragHandle: ReactNode;
  canRemove: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onRemove: () => void;
}

type AccessModelModuleFieldBase = `structure.modules.${number}`;

interface AccessModelModuleTitleProps {
  moduleBase: AccessModelModuleFieldBase;
}

const AccessModelModuleTitle = ({ moduleBase }: AccessModelModuleTitleProps) => {
  const t = useTranslations('protected.access_models');
  const locale = useLocale();

  const { control } = useFormContext<AccessModelFormValues>();

  const localizedName = useWatch({
    control,
    name: `${moduleBase}.translations`,
    compute: (translations) => getAccessModelLocalizedName(translations, locale),
  });
  const moduleKey = useWatch({ control, name: `${moduleBase}.key`, exact: true });

  const moduleTitle = localizedName || moduleKey || t('unnamed_module');

  return (
    <Typography sx={{ minWidth: 0, flex: 1, fontSize: portalFontSize(15), fontWeight: 700 }} noWrap>
      {moduleTitle}
    </Typography>
  );
};

export const AccessModelModuleEditor = ({
  moduleIndex,
  languages,
  dragHandle,
  canRemove,
  expanded,
  onExpandedChange,
  onRemove,
}: AccessModelModuleEditorProps) => {
  const t = useTranslations('protected.access_models');
  const dragContextId = useId();

  const { control, getValues, setValue } = useFormContext<AccessModelFormValues>();

  const [expandedFunctionalityId, setExpandedFunctionalityId] = useState<string | null>(null);

  const shouldExpandAppendedFunctionality = useRef(false);

  const { createValidationRules } = useValidationRules<AccessModelFormValues>();

  const moduleBase = `structure.modules.${moduleIndex}` as const;

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: `${moduleBase}.functionalities`,
    keyName: 'fieldId',
  });
  const functionalities =
    useWatch({
      control,
      name: `${moduleBase}.functionalities`,
    }) ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!shouldExpandAppendedFunctionality.current || !fields.length) {
      return;
    }

    setExpandedFunctionalityId(fields.at(-1)?.fieldId ?? null);
    shouldExpandAppendedFunctionality.current = false;
  }, [fields]);

  const addFunctionality = () => {
    shouldExpandAppendedFunctionality.current = true;
    append(createAccessModelFunctionality(languages, fields.length));
  };

  const reorderFunctionalities = useCallback(
    (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
      const activeIndex = fields.findIndex((field) => field.fieldId === activeId);
      const overIndex = fields.findIndex((field) => field.fieldId === overId);

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return;
      }

      move(activeIndex, overIndex);

      fields.forEach((_, index) => {
        setValue(`${moduleBase}.functionalities.${index}.order`, index, {
          shouldDirty: true,
        });
      });
    },
    [fields, moduleBase, move, setValue],
  );

  const removeFunctionality = (index: number) => {
    const current = getValues(`${moduleBase}.functionalities`);
    const removedFieldId = fields[index]?.fieldId;
    const removedSlug = current[index]?.slug;
    const remaining = current.filter((_, currentIndex) => currentIndex !== index);

    remove(index);

    if (removedFieldId === expandedFunctionalityId) {
      setExpandedFunctionalityId(null);
    }

    remaining.forEach((functionality, currentIndex) => {
      const functionalityBase = `${moduleBase}.functionalities.${currentIndex}` as const;

      setValue(`${functionalityBase}.order`, currentIndex, { shouldDirty: true });

      if (removedSlug && functionality.parentSlug === removedSlug) {
        setValue(`${functionalityBase}.parentSlug`, null, { shouldDirty: true });
      }
    });
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      disableGutters
      elevation={0}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: '10px !important',
        '&::before': { display: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.5, md: 2 },
          bgcolor: 'action.hover',
        }}
      >
        {dragHandle}
        <AccordionSummary
          expandIcon={<Icon name="arrow-right" size={16} />}
          sx={{
            minWidth: 0,
            minHeight: 54,
            flex: 1,
            px: 0,
            '& .MuiAccordionSummary-content': { my: 1, minWidth: 0 },
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(90deg)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
            <AccessModelModuleTitle moduleBase={moduleBase} />
            <Chip
              size="small"
              label={`${t('functionalities')}: ${fields.length}`}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                height: 24,
                mr: 1,
                fontSize: portalFontSize(11),
              }}
            />
          </Box>
        </AccordionSummary>
        <IconButton
          size="small"
          color="error"
          disabled={!canRemove}
          aria-label={t('delete_module')}
          onClick={onRemove}
        >
          <Icon name="trash" size={17} />
        </IconButton>
      </Box>
      <AccordionDetails sx={{ p: { xs: 1.5, md: 2.5 }, display: 'grid', gap: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gap: '1.5rem 1rem',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
          }}
        >
          <TranslationsFields<AccessModelFormValues>
            languages={languages}
            name={`${moduleBase}.translations`}
            textProperty="name"
            label={t('name')}
            rules={createValidationRules('required|max_length[75]')}
            sx={{ gridColumn: { xs: 'auto', md: 'span 7' } }}
          />
          <FormInput<AccessModelFormValues>
            name={`${moduleBase}.key`}
            label={t('module_key')}
            slotProps={{ input: { readOnly: true } }}
            sx={{ gridColumn: { xs: 'auto', md: 'span 4' } }}
          />
          <FormCheckbox<AccessModelFormValues>
            name={`${moduleBase}.isActive`}
            label={t('active')}
            sx={{ gridColumn: { xs: 'auto', md: 'span 1' } }}
          />
        </Box>

        <TranslationsFields<AccessModelFormValues>
          languages={languages}
          name={`${moduleBase}.translations`}
          textProperty="description"
          type="textarea"
          label={t('description')}
          rules={createValidationRules('max_length[255]')}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem 2rem',
            pt: 0.5,
          }}
        >
          <Typography sx={{ fontSize: portalFontSize(14), fontWeight: 700 }}>
            {t('functionalities')}
          </Typography>
          <Button
            type="button"
            variant="outlined"
            icon="plus"
            label={t('create_functionality')}
            onClick={addFunctionality}
          />
        </Box>

        {fields.length ? (
          <DndContext
            id={dragContextId}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={({ active, over }) => {
              if (over) {
                reorderFunctionalities(active.id, over.id);
              }
            }}
          >
            <SortableContext
              items={fields.map((field) => field.fieldId)}
              strategy={verticalListSortingStrategy}
            >
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {fields.map((field, functionalityIndex) => (
                  <AccessModelSortableItem key={field.fieldId} id={field.fieldId}>
                    {(functionalityDragHandle) => (
                      <AccessModelFunctionalityEditor
                        moduleIndex={moduleIndex}
                        functionalityIndex={functionalityIndex}
                        languages={languages}
                        functionalities={functionalities}
                        dragHandle={functionalityDragHandle}
                        expanded={expandedFunctionalityId === field.fieldId}
                        onExpandedChange={(isExpanded) =>
                          setExpandedFunctionalityId(isExpanded ? field.fieldId : null)
                        }
                        onRemove={() => removeFunctionality(functionalityIndex)}
                      />
                    )}
                  </AccessModelSortableItem>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
};
