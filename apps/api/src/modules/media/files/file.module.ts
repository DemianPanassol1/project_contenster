import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '@/modules/media/storage/storage.module';

import { File } from './entities/file.entity';
import { StorageFileTypeRule } from './entities/storage-file-type-rule.entity';
import { StorageProviderConfiguration } from './entities/storage-provider-configuration.entity';
import { StorageProviderCredential } from './entities/storage-provider-credential.entity';
import { FileController } from './file.controller';
import { FileRepository } from './file.repository';
import { FileService } from './file.service';
import { SvgSanitizerService } from './svg-sanitizer.service';

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
  controllers: [FileController],
  providers: [FileRepository, FileService, SvgSanitizerService],
  exports: [FileRepository, FileService],
})
export class FileModule {}
