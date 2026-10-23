import { Module } from '@nestjs/common';

import { ClientStorageModule } from './client-storage/client-storage.module';
import { FileModule } from './files/file.module';

@Module({
  imports: [FileModule, ClientStorageModule],
  exports: [FileModule],
})
export class MediaModule {}
