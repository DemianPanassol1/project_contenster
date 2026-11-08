import type { AccessModelPreviewChange, AccessModelPreviewResponse } from '@contenster/shared';

export interface AccessModelPreviewValues {
  [field: string]: unknown;
}

export const parseAccessModelPreviewValues = (value?: string): AccessModelPreviewValues | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AccessModelPreviewValues)
      : null;
  } catch {
    return null;
  }
};

export const getAccessModelPreviewModuleKey = (change: AccessModelPreviewChange): string | null => {
  if (change.kind.endsWith('_module')) {
    return change.kind === 'delete_module' ? null : change.id.replace(/^module:/, '');
  }

  const values =
    parseAccessModelPreviewValues(change.proposedValue) ??
    parseAccessModelPreviewValues(change.currentValue);
  const moduleKey = values?.moduleKey;

  return typeof moduleKey === 'string' ? moduleKey : null;
};

export const getDefaultSelectedAccessModelChangeIds = (
  preview: AccessModelPreviewResponse,
): string[] =>
  preview.changes
    .filter((change) => change.kind === 'create_module' || change.kind === 'create_functionality')
    .map((change) => change.id);

const addRequiredCreationDependencies = (
  preview: AccessModelPreviewResponse,
  change: AccessModelPreviewChange,
  selected: Set<string>,
): void => {
  const moduleKey = getAccessModelPreviewModuleKey(change);
  const moduleChange = preview.changes.find(
    (item) => item.kind === 'create_module' && getAccessModelPreviewModuleKey(item) === moduleKey,
  );

  if (moduleChange) {
    selected.add(moduleChange.id);
  }

  const parentSlug = parseAccessModelPreviewValues(change.proposedValue)?.parentSlug;

  if (typeof parentSlug !== 'string') {
    return;
  }

  const parentChange = preview.changes.find(
    (item) => item.id === `functionality:${parentSlug}` && item.kind === 'create_functionality',
  );

  if (parentChange && !selected.has(parentChange.id)) {
    selected.add(parentChange.id);
    addRequiredCreationDependencies(preview, parentChange, selected);
  }
};

const removeCreatedDescendants = (
  preview: AccessModelPreviewResponse,
  slug: string,
  selected: Set<string>,
): void => {
  for (const candidate of preview.changes) {
    if (
      candidate.kind !== 'create_functionality' ||
      parseAccessModelPreviewValues(candidate.proposedValue)?.parentSlug !== slug
    ) {
      continue;
    }

    selected.delete(candidate.id);
    removeCreatedDescendants(preview, candidate.id.replace(/^functionality:/, ''), selected);
  }
};

export const getNextSelectedAccessModelChangeIds = (
  preview: AccessModelPreviewResponse,
  selectedChangeIds: string[],
  changeId: string,
  checked: boolean,
): string[] => {
  const selected = new Set(selectedChangeIds);
  const change = preview.changes.find((item) => item.id === changeId);

  if (!change) {
    return selectedChangeIds;
  }

  if (checked) {
    selected.add(change.id);

    if (change.kind.endsWith('_functionality')) {
      addRequiredCreationDependencies(preview, change, selected);
    }

    return [...selected];
  }

  selected.delete(change.id);

  if (change.kind === 'create_module') {
    for (const candidate of preview.changes) {
      if (
        candidate.kind === 'create_functionality' &&
        getAccessModelPreviewModuleKey(candidate) === getAccessModelPreviewModuleKey(change)
      ) {
        selected.delete(candidate.id);
      }
    }
  }

  if (change.kind === 'create_functionality') {
    removeCreatedDescendants(preview, change.id.replace(/^functionality:/, ''), selected);
  }

  return [...selected];
};
