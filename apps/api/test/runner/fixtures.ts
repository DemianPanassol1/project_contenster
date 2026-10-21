import type { DataSource } from 'typeorm';

import { DocumentType } from '@contenster/shared';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { ProfileTranslation } from '@/modules/access-control/profiles/entities/profiles-translation.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { ClientLanguage } from '@/modules/identity/clients/entities/client-language.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';

export interface SecondaryClientFixture {
  clientId: number;
  profileId: number;
}

export const createSecondaryClientFixture = async (
  dataSource: DataSource,
): Promise<SecondaryClientFixture> => {
  const language = await dataSource.getRepository(Language).findOneByOrFail({ languageCode: 'pt' });
  const user = await dataSource.getRepository(User).findOneByOrFail({ username: 'admin' });
  const clientRepository = dataSource.getRepository(Client);
  const client = await clientRepository.save(
    clientRepository.create({
      address: 'Rua de Testes',
      addressNumber: '2',
      city: null,
      corporateName: 'Cliente Secundário de Testes LTDA',
      document: '22222222222',
      documentType: DocumentType.cpf,
      email: 'admin@cliente-secundario.test',
      image: null,
      isActive: true,
      neighborhood: 'Centro',
      primaryPhone: '11999999999',
      secondaryPhone: null,
      slug: 'cliente-secundario-test',
      tradeName: 'Cliente Secundário de Testes',
      zipCode: '01000000',
    }),
  );

  await dataSource.getRepository(ClientLanguage).save({ client, language });

  const profileRepository = dataSource.getRepository(Profile);
  const profile = await profileRepository.save(
    profileRepository.create({ client, isActive: true, permissions: [], translations: [] }),
  );

  await dataSource.getRepository(ProfileTranslation).save({
    description: 'Perfil secundário de testes.',
    language,
    name: 'Administrador secundário',
    profile,
  });

  await dataSource.getRepository(UserProfile).save({ client, profile, user });

  return { clientId: client.id, profileId: profile.id };
};
