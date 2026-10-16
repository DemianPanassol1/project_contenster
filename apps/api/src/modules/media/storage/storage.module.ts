import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageProviderCredential } from '@/modules/media/files/entities/storage-provider-credential.entity';

import { CloudflareR2StorageService } from './cloudflare-r2-storage.service';
import { GoogleCloudStorageService } from './google-cloud-storage.service';
import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageProviderCredential])],
  providers: [
    CloudflareR2StorageService,
    GoogleCloudStorageService,
    LocalStorageService,
    StorageService,
  ],
  exports: [LocalStorageService, StorageService],
})
export class StorageModule {}
