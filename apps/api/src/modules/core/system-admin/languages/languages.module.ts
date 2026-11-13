import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';

import { Language } from './entities/language.entity';
import { SystemAdminLanguagesController } from './languages.controller';
import { LanguagesRepository } from './languages.repository';
import { LanguagesService } from './languages.service';

@Module({
  imports: [AuthenticationModule, TypeOrmModule.forFeature([Language])],
  controllers: [SystemAdminLanguagesController],
  providers: [LanguagesRepository, LanguagesService],
  exports: [LanguagesService],
})
export class SystemAdminLanguagesModule {}
