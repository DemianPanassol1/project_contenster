import type { IconName } from '@/shared';

export interface SystemAdminNavigationItem {
  href:
    | '/system-admin/clients'
    | '/system-admin/access-links'
    | '/system-admin/request-logs'
    | '/system-admin/job-logs'
    | '/system-admin/files'
    | '/system-admin/portals'
    | '/system-admin/languages'
    | '/system-admin/actions'
    | '/system-admin/countries'
    | '/system-admin/states'
    | '/system-admin/cities'
    | '/system-admin/access-models';
  icon: IconName;
  translationKey:
    | 'clients'
    | 'access_links'
    | 'request_logs'
    | 'job_logs'
    | 'files'
    | 'portals'
    | 'languages'
    | 'actions'
    | 'countries'
    | 'states'
    | 'cities'
    | 'access_models';
}

export const systemAdminNavigation = {
  generalRecords: [
    { href: '/system-admin/languages', icon: 'languages', translationKey: 'languages' },
    { href: '/system-admin/actions', icon: 'zap', translationKey: 'actions' },
    { href: '/system-admin/countries', icon: 'globe-2', translationKey: 'countries' },
    { href: '/system-admin/states', icon: 'map', translationKey: 'states' },
    { href: '/system-admin/cities', icon: 'map-pin', translationKey: 'cities' },
  ],
  system: [
    { href: '/system-admin/clients', icon: 'building-2', translationKey: 'clients' },
    {
      href: '/system-admin/access-links',
      icon: 'user-round-check',
      translationKey: 'access_links',
    },
    { href: '/system-admin/request-logs', icon: 'file-clock', translationKey: 'request_logs' },
    { href: '/system-admin/job-logs', icon: 'list-checks', translationKey: 'job_logs' },
    { href: '/system-admin/files', icon: 'files', translationKey: 'files' },
    { href: '/system-admin/portals', icon: 'panels-top-left', translationKey: 'portals' },
    { href: '/system-admin/access-models', icon: 'shield-check', translationKey: 'access_models' },
  ],
} satisfies Record<string, SystemAdminNavigationItem[]>;
