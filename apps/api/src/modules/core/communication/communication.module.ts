import { Module } from '@nestjs/common';

import { LanguagesModule } from './languages/languages.module';

@Module({ imports: [LanguagesModule] })
export class CommunicationModule {}
