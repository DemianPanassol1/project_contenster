import { InitialCore1792129518441 } from './migrations/1792129518441-initial-core';
import { ScopeModulesAndFunctionalitiesByClient1792135000000 } from './migrations/1792135000000-scope-modules-and-functionalities-by-client';
import { AddSystemAdministration1792137000000 } from './migrations/1792137000000-add-system-administration';
import { AddPortals1792138000000 } from './migrations/1792138000000-add-portals';
import { AddPortalTextPalette1792139000000 } from './migrations/1792139000000-add-portal-text-palette';
import { AddAccessModels1792140000000 } from './migrations/1792140000000-add-access-models';
import { CoreSeedReferenceData1792142000000 } from './migrations/1792142000000-core-seed-reference-data';
import { CoreSeedGeography1792142000001 } from './migrations/1792142000001-core-seed-geography';
import { CoreSeedSuperuser1792142000002 } from './migrations/1792142000002-core-seed-superuser';
import { CoreSeedAccessModelCatalog1792142000003 } from './migrations/1792142000003-core-seed-access-model-catalog';

export const coreMigrations = [
  InitialCore1792129518441,
  ScopeModulesAndFunctionalitiesByClient1792135000000,
  AddSystemAdministration1792137000000,
  AddPortals1792138000000,
  AddPortalTextPalette1792139000000,
  AddAccessModels1792140000000,
  CoreSeedReferenceData1792142000000,
  CoreSeedGeography1792142000001,
  CoreSeedSuperuser1792142000002,
  CoreSeedAccessModelCatalog1792142000003,
];
