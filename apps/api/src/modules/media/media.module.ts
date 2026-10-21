import { Module } from '@nestjs/common';

import { ClientStorageModule } from './client-storage/client-storage.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [FilesModule, ClientStorageModule],
  exports: [FilesModule],
})
export class MediaModule {}
