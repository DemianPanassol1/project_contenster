import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageProviderCredential } from '@/modules/core/media/files/entities/storage-provider-credential.entity';

@Injectable()
export class StorageCredentialsRepository {
  constructor(
    @InjectRepository(StorageProviderCredential)
    private readonly credentials: Repository<StorageProviderCredential>,
  ) {}

  findByConfigurationId(configurationId: number): Promise<StorageProviderCredential | null> {
    return this.credentials.findOne({
      where: { storageConfiguration: { id: configurationId } },
    });
  }
}
