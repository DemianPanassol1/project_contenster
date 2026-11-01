import type { GetLanguageByIdResponse } from '@contenster/shared';

import { LanguageListItemResponseDto } from './language-list-item-response.js';

export class GetLanguageByIdResponseDto
  extends LanguageListItemResponseDto
  implements GetLanguageByIdResponse {}
