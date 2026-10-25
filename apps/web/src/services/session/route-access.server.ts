import { type ActionType, type AuthenticatedSession, SessionContextType } from '@contenster/shared';

export const isClientSession = (
  session: AuthenticatedSession | null,
): session is AuthenticatedSession & { context: { type: SessionContextType.client } } =>
  session?.context.type === SessionContextType.client;

export const isGlobalSuperuserSession = (session: AuthenticatedSession | null): boolean =>
  session?.context.type === SessionContextType.global && session.user.isSuperuser;

export const hasFunctionalityAction = (
  session: AuthenticatedSession,
  slug: string,
  action: ActionType,
): boolean => {
  const visit = (
    functionalities: AuthenticatedSession['modules'][number]['functionalities'],
  ): boolean =>
    functionalities.some(
      (functionality) =>
        (functionality.slug === slug &&
          functionality.actions.some((item) => item.type === action)) ||
        visit(functionality.children),
    );

  return session.modules.some((module) => visit(module.functionalities));
};
