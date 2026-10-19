import type { ActionType } from '../../domain/actions/action-type.enum.js';

export interface SessionUser {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface SessionLanguage {
  id: number;
  languageCode: string;
  name: string;
}

export interface SessionClient {
  id: number;
  name: string;
  languages: SessionLanguage[];
}

export interface SessionProfile {
  id: number;
  name: string;
  description: string | null;
}

export interface SessionAction {
  id: number;
  type: ActionType;
  name: string;
  description: string | null;
}

export interface SessionFunctionality {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isNavigationGroup: boolean;
  actions: SessionAction[];
  children: SessionFunctionality[];
}

export interface SessionModule {
  id: number;
  name: string;
  description: string | null;
  order: number;
  functionalities: SessionFunctionality[];
}

export interface AuthenticatedSession {
  user: SessionUser;
  context: {
    client: SessionClient;
    profile: SessionProfile;
  };
  modules: SessionModule[];
}
