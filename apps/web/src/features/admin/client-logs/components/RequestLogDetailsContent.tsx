'use client';

import type { RequestLogDetail } from '@contenster/shared';
import { Box, Divider, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { HttpMethodChip } from './HttpMethodChip';
import { LogField, LogJsonSection, LogSection } from './LogDetailsLayout';

interface RequestLogDetailsContentProps {
  log: RequestLogDetail;
}

export function RequestLogDetailsContent({ log }: RequestLogDetailsContentProps) {
  const locale = useLocale();
  const t = useTranslations('protected.client_logs');
  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
    [locale],
  );
  const emptyLabel = t('not_available');

  return (
    <Box sx={{ display: 'grid', gap: 2, maxHeight: '70vh', overflow: 'auto', pr: 0.5 }}>
      <LogSection title={t('sections.identification')}>
        <LogField emptyLabel={emptyLabel} label={t('fields.internal_id')} value={log.id} />
        <LogField emptyLabel={emptyLabel} label={t('fields.request_id')} value={log.requestId} />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.level')}
          value={t(`levels.${log.level}`)}
        />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.created_at')}
          value={formatDateTime.format(new Date(log.createdAt))}
        />
        <LogField emptyLabel={emptyLabel} label={t('fields.user')} value={log.userName} />
        <LogField emptyLabel={emptyLabel} label={t('fields.event_type')} value={log.eventType} />
      </LogSection>

      <Divider />

      <LogSection title={t('sections.request')}>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 700, mb: 0.25 }}>
            {t('fields.http_method')}
          </Typography>
          <HttpMethodChip method={log.method} />
        </Box>
        <LogField emptyLabel={emptyLabel} label={t('fields.route')} value={log.route} />
        <LogField emptyLabel={emptyLabel} label={t('fields.client_ip')} value={log.ip} />
        <LogField emptyLabel={emptyLabel} label={t('fields.user_agent')} value={log.userAgent} />
        <LogJsonSection
          emptyLabel={t('empty.no_params')}
          label={t('fields.query_params')}
          value={log.queryParams}
        />
        <LogJsonSection
          emptyLabel={t('empty.no_headers')}
          label={t('fields.request_headers')}
          maxHeight={null}
          value={log.requestHeaders}
        />
        <LogJsonSection
          emptyLabel={t('empty.no_request_body')}
          label={t('fields.request_body')}
          value={log.requestBody}
        />
      </LogSection>

      <Divider />

      <LogSection title={t('sections.response')}>
        <LogField emptyLabel={emptyLabel} label={t('fields.http_status')} value={log.statusCode} />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.response_time_ms')}
          value={log.responseTimeMs}
        />
        <LogField
          emptyLabel={emptyLabel}
          label={t('fields.response_time')}
          value={log.responseTimeDescription}
        />
        <LogJsonSection
          emptyLabel={t('empty.no_headers')}
          label={t('fields.response_headers')}
          maxHeight={null}
          value={log.responseHeaders}
        />
        <LogJsonSection
          emptyLabel={t('empty.no_response_body')}
          label={t('fields.response_body')}
          value={log.responseBody}
        />
        <LogJsonSection
          emptyLabel={t('empty.no_errors')}
          label={t('fields.error')}
          value={log.error}
        />
      </LogSection>
    </Box>
  );
}
