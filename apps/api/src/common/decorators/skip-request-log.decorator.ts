import { SetMetadata } from '@nestjs/common';

export const SKIP_REQUEST_LOG_METADATA_KEY = 'skipRequestLog';

export const SkipRequestLog = () => SetMetadata(SKIP_REQUEST_LOG_METADATA_KEY, true);
