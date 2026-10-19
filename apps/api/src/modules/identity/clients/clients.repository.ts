import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { City } from '@/modules/locations/cities/entities/city.entity';

import { Client } from './entities/client.entity';
import { ClientLanguage } from './entities/client-language.entity';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(City) private readonly cities: Repository<City>,
  ) {}

  findById(id: number): Promise<Client | null> {
    return this.clients.findOne({
      where: { id },
      relations: { image: true, city: true, availableLanguageLinks: { language: true } },
    });
  }

  findCity(id: number): Promise<City | null> {
    return this.cities.findOneBy({ id });
  }

  findLanguages(ids: number[]): Promise<Language[]> {
    return this.languages.findBy({ id: In(ids) });
  }

  async save(
    client: DeepPartial<Client> & { availableLanguageLinks: DeepPartial<ClientLanguage>[] },
  ): Promise<Client> {
    return this.clients.save(client);
  }
}
