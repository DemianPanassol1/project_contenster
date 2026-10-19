export enum StorageProvider {
  local = 'local',
  cloudflareR2 = 'cloudflare_r2',
  googleCloudStorage = 'google_cloud_storage',
}

export const storageProviderDictionary = {
  [StorageProvider.local]: 'enums.storage_provider.local',
  [StorageProvider.cloudflareR2]: 'enums.storage_provider.cloudflare_r2',
  [StorageProvider.googleCloudStorage]: 'enums.storage_provider.google_cloud_storage',
} as const satisfies Record<StorageProvider, string>;
