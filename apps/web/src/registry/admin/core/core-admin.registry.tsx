import { ActionType } from '@contenster/shared';

import type { AdminFeatureBinding } from '../admin.registry.type';

export const CORE_ADMIN_FEATURE_BINDINGS = [
  { slug: 'clients', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  {
    slug: 'client-storage',
    modes: { list: { action: ActionType.view, View: () => <div /> } },
  },
  { slug: 'client-logs', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  { slug: 'users', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  { slug: 'profiles', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  { slug: 'modules', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  {
    slug: 'functionalities',
    modes: { list: { action: ActionType.view, View: () => <div /> } },
  },
  { slug: 'countries', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  { slug: 'states', modes: { list: { action: ActionType.view, View: () => <div /> } } },
  { slug: 'cities', modes: { list: { action: ActionType.view, View: () => <div /> } } },
] as const satisfies readonly AdminFeatureBinding[];
