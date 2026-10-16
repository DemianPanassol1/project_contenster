import { Module } from '@nestjs/common';

import { FilesModule } from './files/files.module';

@Module({
  imports: [FilesModule],
  exports: [FilesModule],
})
export class MediaModule {}
