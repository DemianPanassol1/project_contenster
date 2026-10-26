import {
  type ActionType,
  type AuthenticatedSession,
  SessionContextType,
  type SessionLanguage,
  type SessionModule,
} from '@contenster/shared';

export interface SessionFeaturePresentation {
  actions: ActionType[];
  description: string | null;
  functionalityName: string;
  languages: SessionLanguage[];
  moduleName: string;
}

export const isClientSession = (
  session: AuthenticatedSession | null,
): session is AuthenticatedSession & { context: { type: SessionContextType.client } } =>
  session?.context.type === SessionContextType.client;

export const isGlobalSuperuserSession = (session: AuthenticatedSession | null): boolean =>
  session?.context.type === SessionContextType.global && session.user.isSuperuser;

export const getSessionFeaturePresentation = (
  session: AuthenticatedSession & { context: { type: SessionContextType.client } },
  slug: string,
): SessionFeaturePresentation | null => {
  for (const systemModule of session.modules) {
    const functionality = findSessionFunctionality(systemModule, slug);

    if (functionality) {
      return {
        actions: functionality.actions.map((action) => action.type),
        description: functionality.description,
        functionalityName: functionality.name,
        languages: session.context.client.languages,
        moduleName: systemModule.name,
      };
    }
  }

  return null;
};

const findSessionFunctionality = (module: SessionModule, slug: string) => {
  const visit = (
    functionalities: AuthenticatedSession['modules'][number]['functionalities'],
  ): AuthenticatedSession['modules'][number]['functionalities'][number] | null => {
    for (const functionality of functionalities) {
      if (functionality.slug === slug) {
        return functionality;
      }

      const nestedFunctionality = visit(functionality.children);

      if (nestedFunctionality) {
        return nestedFunctionality;
      }
    }

    return null;
  };

  return visit(module.functionalities);
};
