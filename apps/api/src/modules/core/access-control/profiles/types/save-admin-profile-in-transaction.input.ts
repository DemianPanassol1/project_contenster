export interface SaveAdminProfileInTransactionInput {
  clientId: number;
  translations: Array<{
    description: string | null;
    locale: string;
    name: string;
  }>;
}
