import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';

import { Language } from './entities/language.entity';
import { LanguagesController } from './languages.controller';
import { LanguagesRepository } from './languages.repository';
import { LanguagesService } from './languages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language]), AuthenticationModule],
  controllers: [LanguagesController],
  providers: [LanguagesRepository, LanguagesService],
})
export class LanguagesModule {}
