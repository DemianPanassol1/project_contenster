import type { SaveClientRequest } from '@contenster/shared';

export type SaveClientInTransactionInput = Omit<SaveClientRequest, 'slug'> & {
  slug?: string;
};
