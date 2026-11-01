import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { File } from '@/modules/core/media/files/entities/file.entity';

import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, File])],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
})
export class FilesModule {}
