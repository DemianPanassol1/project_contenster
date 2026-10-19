import type {
  ActionType,
  AuthenticatedSession,
  SessionAction,
  SessionFunctionality,
  SessionModule,
} from '@contenster/shared';
import { Injectable } from '@nestjs/common';

import { AuthorizationRepository } from './authorization.repository';

interface PermissionRequirement {
  functionalitySlug: string;
  action: ActionType;
}

@Injectable()
export class AuthorizationResolverService {
  constructor(private readonly authorizationRepository: AuthorizationRepository) {}

  async resolve(
    profileId: number,
    clientId: number,
    languageCode: string,
  ): Promise<SessionModule[]> {
    const permissions = await this.authorizationRepository.findActivePermissions(
      profileId,
      clientId,
    );
    const modules = new Map<number, SessionModule>();
    const functionalityById = new Map<number, SessionFunctionality>();
    const rootFunctionalityIds = new Map<number, number[]>();

    for (const permission of permissions) {
      const { action, functionality } = permission;
      const module = functionality.module;
      const sessionModule = modules.get(module.id) ?? {
        id: module.id,
        name: this.translation(module.translations, languageCode).name,
        description: this.translation(module.translations, languageCode).description,
        order: module.order,
        functionalities: [],
      };
      modules.set(module.id, sessionModule);

      const sessionFunctionality = functionalityById.get(functionality.id) ?? {
        id: functionality.id,
        slug: functionality.slug,
        name: this.translation(functionality.translations, languageCode).name,
        description: this.translation(functionality.translations, languageCode).description,
        icon: functionality.icon,
        order: functionality.order,
        isNavigationGroup: functionality.isNavigationGroup,
        actions: [],
        children: [],
      };
      functionalityById.set(functionality.id, sessionFunctionality);

      if (!sessionFunctionality.actions.some((item) => item.id === action.id)) {
        const translation = this.translation(action.translations, languageCode);
        sessionFunctionality.actions.push({
          id: action.id,
          type: action.type,
          name: translation.name,
          description: translation.description,
        });
      }

      const parentId = functionality.parent?.id ?? null;
      if (parentId) {
        const parentEntity = functionality.parent!;
        const parent = functionalityById.get(parentId) ?? {
          id: parentEntity.id,
          slug: parentEntity.slug,
          name: this.translation(parentEntity.translations, languageCode).name,
          description: this.translation(parentEntity.translations, languageCode).description,
          icon: parentEntity.icon,
          order: parentEntity.order,
          isNavigationGroup: parentEntity.isNavigationGroup,
          actions: [],
          children: [],
        };
        functionalityById.set(parentId, parent);
        if (!parent.children.some((child) => child.id === sessionFunctionality.id)) {
          parent.children.push(sessionFunctionality);
        }
        const rootIds = rootFunctionalityIds.get(module.id) ?? [];
        if (!rootIds.includes(parent.id)) rootIds.push(parent.id);
        rootFunctionalityIds.set(module.id, rootIds);
      } else {
        const rootIds = rootFunctionalityIds.get(module.id) ?? [];
        if (!rootIds.includes(sessionFunctionality.id)) rootIds.push(sessionFunctionality.id);
        rootFunctionalityIds.set(module.id, rootIds);
      }
    }

    for (const module of modules.values()) {
      for (const id of rootFunctionalityIds.get(module.id) ?? []) {
        const functionality = functionalityById.get(id);
        if (functionality) module.functionalities.push(functionality);
      }
      this.sortFunctionalities(module.functionalities);
    }

    return [...modules.values()].sort(
      (left, right) => left.order - right.order || left.id - right.id,
    );
  }

  hasPermission(session: AuthenticatedSession, requirement: PermissionRequirement): boolean {
    const find = (functionalities: SessionFunctionality[]): boolean =>
      functionalities.some(
        (functionality) =>
          (functionality.slug === requirement.functionalitySlug &&
            functionality.actions.some((action) => action.type === requirement.action)) ||
          find(functionality.children),
      );

    return session.modules.some((module) => find(module.functionalities));
  }

  private sortFunctionalities(functionalities: SessionFunctionality[]): void {
    functionalities.sort((left, right) => left.order - right.order || left.id - right.id);
    for (const functionality of functionalities) {
      functionality.actions.sort((left, right) => left.id - right.id);
      this.sortFunctionalities(functionality.children);
    }
  }

  private translation<
    T extends { language: { languageCode: string }; name: string; description: string | null },
  >(translations: T[], languageCode: string): Pick<SessionAction, 'name' | 'description'> {
    return (
      translations.find((translation) => translation.language.languageCode === languageCode) ??
      translations[0]
    );
  }
}
