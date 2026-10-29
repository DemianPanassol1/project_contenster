import type { ActionType } from '../../domain/actions/action-type.enum.js';
import type { DocumentType } from '../../domain/documents/document-type.enum.js';
import type { RequestLogAccessType } from '../../domain/logging/request-log-access-type.enum.js';

import type { SessionContextType } from './session-context-type.enum.js';

export interface SessionUser {
  imageUrl: string | null;
  id: number;
  isSuperuser: boolean;
  name: string;
  username: string;
  email: string;
}

export interface SessionLanguage {
  id: number;
  locale: string;
  name: string;
}

export interface SessionClient {
  document: string;
  documentType: DocumentType;
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

export interface GlobalSessionContext {
  type: SessionContextType.global;
}

export interface ClientSessionContext {
  accessType: RequestLogAccessType;
  client: SessionClient;
  profile: SessionProfile;
  type: SessionContextType.client;
}

export interface AuthenticatedSession {
  user: SessionUser;
  context: ClientSessionContext | GlobalSessionContext;
  modules: SessionModule[];
}
