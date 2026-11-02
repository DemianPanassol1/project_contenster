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
    { href: '/system-admin/languages', icon: 'globe', translationKey: 'languages' },
    { href: '/system-admin/actions', icon: 'logs', translationKey: 'actions' },
    { href: '/system-admin/countries', icon: 'heart', translationKey: 'countries' },
    { href: '/system-admin/states', icon: 'folder', translationKey: 'states' },
    { href: '/system-admin/cities', icon: 'building-2', translationKey: 'cities' },
  ],
  system: [
    { href: '/system-admin/clients', icon: 'building-2', translationKey: 'clients' },
    { href: '/system-admin/access-links', icon: 'user-check', translationKey: 'access_links' },
    { href: '/system-admin/request-logs', icon: 'logs', translationKey: 'request_logs' },
    { href: '/system-admin/job-logs', icon: 'scroll-text', translationKey: 'job_logs' },
    { href: '/system-admin/files', icon: 'folder', translationKey: 'files' },
    { href: '/system-admin/portals', icon: 'folder', translationKey: 'portals' },
    { href: '/system-admin/access-models', icon: 'code', translationKey: 'access_models' },
  ],
} satisfies Record<string, SystemAdminNavigationItem[]>;
