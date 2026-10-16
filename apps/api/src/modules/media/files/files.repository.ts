import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, LessThanOrEqual, Repository } from 'typeorm';

import { FileType } from '@contenster/shared';

import { File } from './entities/file.entity';
import { StorageFileTypeRule } from './entities/storage-file-type-rule.entity';

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(File)
    private readonly files: Repository<File>,
    @InjectRepository(StorageFileTypeRule)
    private readonly rules: Repository<StorageFileTypeRule>,
  ) {}

  findById(id: number, clientId: number): Promise<File | null> {
    return this.files.findOne({
      relations: { client: true, storageConfiguration: true, uploadedBy: true },
      where: { id, client: { id: clientId } },
    });
  }

  findCleanupCandidates(createdBefore: Date): Promise<File[]> {
    return this.files.find({
      relations: { storageConfiguration: true },
      where: { createdAt: LessThanOrEqual(createdBefore) },
      order: { id: 'ASC' },
    });
  }

  save(file: DeepPartial<File>): Promise<File> {
    return this.files.save(file);
  }

  remove(file: File): Promise<File> {
    return this.files.remove(file);
  }

  findActiveStorageFileTypeRule(
    clientId: number,
    fileType: FileType,
  ): Promise<StorageFileTypeRule | null> {
    return this.rules.findOne({
      relations: { storageConfiguration: true },
      where: {
        client: { id: clientId },
        fileType,
        isActive: true,
        storageConfiguration: { isActive: true },
      },
      order: { id: 'DESC' },
    });
  }
}
