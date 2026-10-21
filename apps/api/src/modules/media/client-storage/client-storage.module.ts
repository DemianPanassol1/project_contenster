import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '@/modules/media/storage/storage.module';

import { File } from '../files/entities/file.entity';
import { StorageFileTypeRule } from '../files/entities/storage-file-type-rule.entity';
import { StorageProviderConfiguration } from '../files/entities/storage-provider-configuration.entity';
import { StorageProviderCredential } from '../files/entities/storage-provider-credential.entity';

import { ClientStorageController } from './client-storage.controller';
import { ClientStorageRepository } from './client-storage.repository';
import { ClientStorageService } from './client-storage.service';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      File,
      StorageFileTypeRule,
      StorageProviderConfiguration,
      StorageProviderCredential,
    ]),
  ],
  controllers: [ClientStorageController],
  providers: [ClientStorageRepository, ClientStorageService],
})
export class ClientStorageModule {}
