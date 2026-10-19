import type { ActionType } from '../../../domain/actions/action-type.enum.js';

export interface ActionTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}

export type ActionTranslationResponse = ActionTranslationInput;

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
