import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createDatabaseOptions } from './database.config';

@Module({
  imports: [TypeOrmModule.forRoot(createDatabaseOptions())],
})
export class DatabaseModule {}
