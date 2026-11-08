import type { PaginatedBody } from '../../../platform/index.js';

export interface AccessModelTranslationInput {
  id: number | null;
  locale: string;
  name: string;
  description: string | null;
}

export interface AccessModelTranslationResponse extends AccessModelTranslationInput {
  id: number;
}

export interface AccessModelModuleTranslation {
  locale: string;
  name: string;
  description: string | null;
}

export interface AccessModelFunctionalityDefinition {
  slug: string;
  parentSlug: string | null;
  icon: string | null;
  order: number;
  isNavigationGroup: boolean;
  isActive: boolean;
  enabledLanguageCodes: string[];
  translations: AccessModelModuleTranslation[];
}

export interface AccessModelModuleDefinition {
  key: string | null;
  order: number;
  isActive: boolean;
  translations: AccessModelModuleTranslation[];
  functionalities: AccessModelFunctionalityDefinition[];
}

export interface AccessModelStructure {
  modules: AccessModelModuleDefinition[];
}

export interface SaveAccessModelRequest {
  id: number | null;
  isActive: boolean;
  translations: AccessModelTranslationInput[];
  structure: AccessModelStructure;
}

export interface AccessModelListItem {
  id: number;
  isActive: boolean;
  name: string;
  description: string | null;
  moduleCount: number;
  functionalityCount: number;
  updatedAt: string;
}

export interface GetAccessModelByIdResponse extends AccessModelListItem {
  translations: AccessModelTranslationResponse[];
  structure: AccessModelStructure;
}

export type AccessModelListResponse = PaginatedBody<AccessModelListItem>;

export type AccessModelChangeKind =
  | 'create_module'
  | 'update_module'
  | 'delete_module'
  | 'create_functionality'
  | 'update_functionality'
  | 'delete_functionality';

export interface AccessModelPreviewChange {
  id: string;
  kind: AccessModelChangeKind;
  label: string;
  description: string | null;
  affectedItems: string[];
  currentValue?: string;
  proposedValue?: string;
}

export interface AccessModelPreviewConflict {
  code:
    | 'admin_profile_invalid'
    | 'missing_enabled_translation'
    | 'module_key_conflict'
    | 'parent_module_mismatch';
  message: string;
}

export interface AccessModelPreviewAlignedResource {
  id: string;
  label: string;
  moduleKey: string;
  type: 'module' | 'functionality';
}

export interface AccessModelPreviewResponse {
  alignedResources: AccessModelPreviewAlignedResource[];
  moduleNames: Record<string, string>;
  fingerprint: string;
  changes: AccessModelPreviewChange[];
  conflicts: AccessModelPreviewConflict[];
}

export interface PreviewAccessModelRequest {
  modelId: number;
}

export interface ApplyAccessModelRequest extends PreviewAccessModelRequest {
  fingerprint: string;
  selectedChangeIds: string[];
}

export interface ApplyAccessModelResponse {
  createdFunctionalities: number;
  createdModules: number;
  deletedFunctionalities: number;
  deletedModules: number;
  updatedFunctionalities: number;
  updatedModules: number;
}
