'use client';

import type { CronExecutionLogDetail } from '@contenster/shared';
import { Box, Divider } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';

import { LogField, LogJsonSection, LogSection } from '@/shared/observability';
import { formatDateTime } from '@/utils';

export function SystemAdminJobLogDetailsContent({ log }: { log: CronExecutionLogDetail }) {
  const locale = useLocale();
  const t = useTranslations('protected.system_admin.job_logs');
  const emptyLabel = t('not_available');
  const duration = log.durationMs === null ? null : `${log.durationMs}ms`;

  return (
    <Box sx={{ display: 'grid', gap: 2, maxHeight: '70vh', overflow: 'auto', pr: 0.5 }}>
      <LogSection title={t('sections.identification')}>
        <LogField emptyLabel={emptyLabel} label={t('fields.internal_id')} value={log.id} />
        <LogField emptyLabel={emptyLabel} label={t('fields.task')} value={log.taskName} />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.status')}
          value={t(`statuses.${log.status}`)}
        />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.created_at')}
          value={formatDateTime(log.createdAt, locale)}
        />
      </LogSection>
      <Divider />
      <LogSection title={t('sections.execution')}>
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.started_at')}
          value={formatDateTime(log.startedAt, locale)}
        />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.finished_at')}
          value={log.finishedAt ? formatDateTime(log.finishedAt, locale) : null}
        />
        <LogField emptyLabel={emptyLabel} label={t('fields.duration')} value={duration} />
        <LogField emptyLabel={emptyLabel} label={t('fields.message')} value={log.message} />
      </LogSection>
      <Divider />
      <LogSection title={t('sections.result')}>
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.total_processed')}
          value={log.totalProcessed}
        />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.total_success')}
          value={log.totalSuccess}
        />
        <LogField emptyLabel={emptyLabel} label={t('fields.total_error')} value={log.totalError} />
        <LogJsonSection
          emptyLabel={t('empty.no_errors')}
          label={t('fields.error')}
          value={log.error}
        />
      </LogSection>
    </Box>
  );
}
