import type { IconName } from '@/shared';

export interface SystemAdminNavigationItem {
  href:
    | '/system-admin/clients'
    | '/system-admin/access-links'
    | '/system-admin/request-logs'
    | '/system-admin/job-logs'
    | '/system-admin/files'
    | '/system-admin/portals';
  icon: IconName;
  translationKey: 'clients' | 'access_links' | 'request_logs' | 'job_logs' | 'files' | 'portals';
}

export const systemAdminNavigation: SystemAdminNavigationItem[] = [
  { href: '/system-admin/clients', icon: 'building-2', translationKey: 'clients' },
  { href: '/system-admin/access-links', icon: 'user-check', translationKey: 'access_links' },
  { href: '/system-admin/request-logs', icon: 'logs', translationKey: 'request_logs' },
  { href: '/system-admin/job-logs', icon: 'scroll-text', translationKey: 'job_logs' },
  { href: '/system-admin/files', icon: 'folder', translationKey: 'files' },
  { href: '/system-admin/portals', icon: 'globe', translationKey: 'portals' },
];
