import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { ActionSaveView, ActionsListView } from '@/features/admin/actions';
import { CitiesListView, CitySaveView } from '@/features/admin/cities';
import { CountriesListView, CountrySaveView } from '@/features/admin/countries';
import { FunctionalitiesListView, FunctionalitySaveView } from '@/features/admin/functionalities';
import { LanguageSaveView, LanguagesListView } from '@/features/admin/languages';
import { SystemModuleSaveView, SystemModulesListView } from '@/features/admin/modules';
import { ProfileSaveView, ProfilesListView } from '@/features/admin/profiles';
import { StateSaveView, StatesListView } from '@/features/admin/states';

import type { AdminFeatureBinding } from '../admin.registry.type';

export const CORE_ADMIN_FEATURE_BINDINGS: readonly AdminFeatureBinding[] = [
  {
    modes: {
      create: { action: ActionType.create, View: ProfileSaveView },
      list: { action: ActionType.view, View: ProfilesListView },
      update: { action: ActionType.edit, View: ProfileSaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.profiles,
  },
  {
    modes: {
      create: { action: ActionType.create, View: FunctionalitySaveView },
      list: { action: ActionType.view, View: FunctionalitiesListView },
      update: { action: ActionType.edit, View: FunctionalitySaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.functionalities,
  },
  {
    modes: {
      create: { action: ActionType.create, View: CitySaveView },
      list: { action: ActionType.view, View: CitiesListView },
      update: { action: ActionType.edit, View: CitySaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.cities,
  },
  {
    modes: {
      create: { action: ActionType.create, View: StateSaveView },
      list: { action: ActionType.view, View: StatesListView },
      update: { action: ActionType.edit, View: StateSaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.states,
  },
  {
    modes: {
      create: { action: ActionType.create, View: ActionSaveView },
      list: { action: ActionType.view, View: ActionsListView },
      update: { action: ActionType.edit, View: ActionSaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.actions,
  },
  {
    modes: {
      create: { action: ActionType.create, View: LanguageSaveView },
      list: { action: ActionType.view, View: LanguagesListView },
      update: { action: ActionType.edit, View: LanguageSaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.languages,
  },
  {
    modes: {
      create: { action: ActionType.create, View: CountrySaveView },
      list: { action: ActionType.view, View: CountriesListView },
      update: { action: ActionType.edit, View: CountrySaveView },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.countries,
  },
  {
    modes: {
      create: {
        action: ActionType.create,
        View: SystemModuleSaveView,
      },
      list: {
        action: ActionType.view,
        View: SystemModulesListView,
      },
      update: {
        action: ActionType.edit,
        View: SystemModuleSaveView,
      },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.modules,
  },
];
