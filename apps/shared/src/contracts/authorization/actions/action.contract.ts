import type { ActionType } from '../../../domain/actions/action-type.enum.js';

export interface ActionTranslationInput {
  id: number | null;
  locale: string;
  name: string;
  description: string | null;
}

export interface ActionTranslationResponse {
  id: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface SaveActionRequest {
  id: number | null;
  type: ActionType;
  translations: ActionTranslationInput[];
}

export interface ActionListItem {
  id: number;
  type: ActionType;
  name: string;
  description: string | null;
}

export interface GetActionByIdResponse extends ActionListItem {
  translations: ActionTranslationResponse[];
}
