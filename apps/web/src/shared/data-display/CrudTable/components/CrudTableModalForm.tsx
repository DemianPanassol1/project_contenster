'use client';

import type { FieldValues } from 'react-hook-form';

import { FormWrapper } from '@/shared/form';

import type { CrudTableModalFormProps } from '../types/crud-table.types';

export const CrudTableModalForm = <TRow extends FieldValues>({
  formId,
  mode,
  fields,
  row,
  renderForm,
  onSubmit,
}: CrudTableModalFormProps<TRow>) => {
  return (
    <FormWrapper<TRow>
      id={formId}
      fields={fields}
      showPaper={false}
      onSubmit={async (content) => {
        await onSubmit(content);
      }}
    >
      {renderForm({ mode, row })}
    </FormWrapper>
  );
};
