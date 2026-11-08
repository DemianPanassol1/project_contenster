import type { MigrationInterface, QueryRunner } from 'typeorm';

// Fonte: IBGE, Censo Demográfico 2022, tabela SIDRA 4709.
// Critério: até 15 municípios com maior população residente por UF.
// O Distrito Federal possui somente Brasília neste nível territorial.
const brazilianStates = [
  ['AC', 'Acre'],
  ['AL', 'Alagoas'],
  ['AM', 'Amazonas'],
  ['AP', 'Amapá'],
  ['BA', 'Bahia'],
  ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'],
  ['MA', 'Maranhão'],
  ['MG', 'Minas Gerais'],
  ['MS', 'Mato Grosso do Sul'],
  ['MT', 'Mato Grosso'],
  ['PA', 'Pará'],
  ['PB', 'Paraíba'],
  ['PE', 'Pernambuco'],
  ['PI', 'Piauí'],
  ['PR', 'Paraná'],
  ['RJ', 'Rio de Janeiro'],
  ['RN', 'Rio Grande do Norte'],
  ['RO', 'Rondônia'],
  ['RR', 'Roraima'],
  ['RS', 'Rio Grande do Sul'],
  ['SC', 'Santa Catarina'],
  ['SE', 'Sergipe'],
  ['SP', 'São Paulo'],
  ['TO', 'Tocantins'],
] as const;

const brazilianCities = [
  ['AC', '1200401', 'Rio Branco'],
  ['AC', '1200203', 'Cruzeiro do Sul'],
  ['AC', '1200609', 'Tarauacá'],
  ['AC', '1200500', 'Sena Madureira'],
  ['AC', '1200302', 'Feijó'],
  ['AC', '1200104', 'Brasiléia'],
  ['AC', '1200450', 'Senador Guiomard'],
  ['AC', '1200336', 'Mâncio Lima'],
  ['AC', '1200252', 'Epitaciolândia'],
  ['AC', '1200708', 'Xapuri'],
  ['AC', '1200351', 'Marechal Thaumaturgo'],
  ['AC', '1200807', 'Porto Acre'],
  ['AC', '1200385', 'Plácido de Castro'],
  ['AC', '1200427', 'Rodrigues Alves'],
  ['AC', '1200013', 'Acrelândia'],
  ['AL', '2704302', 'Maceió'],
  ['AL', '2700300', 'Arapiraca'],
  ['AL', '2707701', 'Rio Largo'],
  ['AL', '2706307', 'Palmeira dos Índios'],
  ['AL', '2704708', 'Marechal Deodoro'],
  ['AL', '2709301', 'União dos Palmares'],
  ['AL', '2706703', 'Penedo'],
  ['AL', '2708600', 'São Miguel dos Campos'],
  ['AL', '2702405', 'Delmiro Gouveia'],
  ['AL', '2702306', 'Coruripe'],
  ['AL', '2708006', 'Santana do Ipanema'],
  ['AL', '2709152', 'Teotônio Vilela'],
  ['AL', '2700409', 'Atalaia'],
  ['AL', '2702900', 'Girau do Ponciano'],
  ['AL', '2706901', 'Pilar'],
  ['AM', '1302603', 'Manaus'],
  ['AM', '1301902', 'Itacoatiara'],
  ['AM', '1302504', 'Manacapuru'],
  ['AM', '1303403', 'Parintins'],
  ['AM', '1304203', 'Tefé'],
  ['AM', '1301209', 'Coari'],
  ['AM', '1304062', 'Tabatinga'],
  ['AM', '1302900', 'Maués'],
  ['AM', '1301852', 'Iranduba'],
  ['AM', '1301704', 'Humaitá'],
  ['AM', '1302702', 'Manicoré'],
  ['AM', '1303809', 'São Gabriel da Cachoeira'],
  ['AM', '1302405', 'Lábrea'],
  ['AM', '1300300', 'Autazes'],
  ['AM', '1300607', 'Benjamin Constant'],
  ['AP', '1600303', 'Macapá'],
  ['AP', '1600600', 'Santana'],
  ['AP', '1600279', 'Laranjal do Jari'],
  ['AP', '1600501', 'Oiapoque'],
  ['AP', '1600402', 'Mazagão'],
  ['AP', '1600535', 'Porto Grande'],
  ['AP', '1600709', 'Tartarugalzinho'],
  ['AP', '1600154', 'Pedra Branca do Amapari'],
  ['AP', '1600808', 'Vitória do Jari'],
  ['AP', '1600204', 'Calçoene'],
  ['AP', '1600105', 'Amapá'],
  ['AP', '1600238', 'Ferreira Gomes'],
  ['AP', '1600253', 'Itaubal'],
  ['AP', '1600055', 'Serra do Navio'],
  ['AP', '1600212', 'Cutias'],
  ['BA', '2927408', 'Salvador'],
  ['BA', '2910800', 'Feira de Santana'],
  ['BA', '2933307', 'Vitória da Conquista'],
  ['BA', '2905701', 'Camaçari'],
  ['BA', '2918407', 'Juazeiro'],
  ['BA', '2919207', 'Lauro de Freitas'],
  ['BA', '2914802', 'Itabuna'],
  ['BA', '2913606', 'Ilhéus'],
  ['BA', '2925303', 'Porto Seguro'],
  ['BA', '2903201', 'Barreiras'],
  ['BA', '2918001', 'Jequié'],
  ['BA', '2900702', 'Alagoinhas'],
  ['BA', '2931350', 'Teixeira de Freitas'],
  ['BA', '2930709', 'Simões Filho'],
  ['BA', '2910727', 'Eunápolis'],
  ['CE', '2304400', 'Fortaleza'],
  ['CE', '2303709', 'Caucaia'],
  ['CE', '2307304', 'Juazeiro do Norte'],
  ['CE', '2307650', 'Maracanaú'],
  ['CE', '2312908', 'Sobral'],
  ['CE', '2306405', 'Itapipoca'],
  ['CE', '2304202', 'Crato'],
  ['CE', '2307700', 'Maranguape'],
  ['CE', '2305506', 'Iguatu'],
  ['CE', '2311306', 'Quixadá'],
  ['CE', '2311405', 'Quixeramobim'],
  ['CE', '2309706', 'Pacatuba'],
  ['CE', '2313401', 'Tianguá'],
  ['CE', '2301000', 'Aquiraz'],
  ['CE', '2304103', 'Crateús'],
  ['DF', '5300108', 'Brasília'],
  ['ES', '3205002', 'Serra'],
  ['ES', '3205200', 'Vila Velha'],
  ['ES', '3201308', 'Cariacica'],
  ['ES', '3205309', 'Vitória'],
  ['ES', '3201209', 'Cachoeiro de Itapemirim'],
  ['ES', '3203205', 'Linhares'],
  ['ES', '3202405', 'Guarapari'],
  ['ES', '3204906', 'São Mateus'],
  ['ES', '3201506', 'Colatina'],
  ['ES', '3200607', 'Aracruz'],
  ['ES', '3205101', 'Viana'],
  ['ES', '3203908', 'Nova Venécia'],
  ['ES', '3200904', 'Barra de São Francisco'],
  ['ES', '3203320', 'Marataízes'],
  ['ES', '3204559', 'Santa Maria de Jetibá'],
  ['GO', '5208707', 'Goiânia'],
  ['GO', '5201405', 'Aparecida de Goiânia'],
  ['GO', '5201108', 'Anápolis'],
  ['GO', '5218805', 'Rio Verde'],
  ['GO', '5200258', 'Águas Lindas de Goiás'],
  ['GO', '5212501', 'Luziânia'],
  ['GO', '5221858', 'Valparaíso de Goiás'],
  ['GO', '5220454', 'Senador Canedo'],
  ['GO', '5221403', 'Trindade'],
  ['GO', '5208004', 'Formosa'],
  ['GO', '5205109', 'Catalão'],
  ['GO', '5211503', 'Itumbiara'],
  ['GO', '5211909', 'Jataí'],
  ['GO', '5217609', 'Planaltina'],
  ['GO', '5215231', 'Novo Gama'],
  ['MA', '2111300', 'São Luís'],
  ['MA', '2105302', 'Imperatriz'],
  ['MA', '2111201', 'São José de Ribamar'],
  ['MA', '2112209', 'Timon'],
  ['MA', '2103000', 'Caxias'],
  ['MA', '2107506', 'Paço do Lumiar'],
  ['MA', '2103307', 'Codó'],
  ['MA', '2100055', 'Açailândia'],
  ['MA', '2101202', 'Bacabal'],
  ['MA', '2101400', 'Balsas'],
  ['MA', '2109908', 'Santa Inês'],
  ['MA', '2108603', 'Pinheiro'],
  ['MA', '2101608', 'Barra do Corda'],
  ['MA', '2103208', 'Chapadinha'],
  ['MA', '2104800', 'Grajaú'],
  ['MG', '3106200', 'Belo Horizonte'],
  ['MG', '3170206', 'Uberlândia'],
  ['MG', '3118601', 'Contagem'],
  ['MG', '3136702', 'Juiz de Fora'],
  ['MG', '3143302', 'Montes Claros'],
  ['MG', '3106705', 'Betim'],
  ['MG', '3170107', 'Uberaba'],
  ['MG', '3154606', 'Ribeirão das Neves'],
  ['MG', '3127701', 'Governador Valadares'],
  ['MG', '3122306', 'Divinópolis'],
  ['MG', '3131307', 'Ipatinga'],
  ['MG', '3167202', 'Sete Lagoas'],
  ['MG', '3157807', 'Santa Luzia'],
  ['MG', '3129806', 'Ibirité'],
  ['MG', '3151800', 'Poços de Caldas'],
  ['MS', '5002704', 'Campo Grande'],
  ['MS', '5003702', 'Dourados'],
  ['MS', '5008305', 'Três Lagoas'],
  ['MS', '5003207', 'Corumbá'],
  ['MS', '5006606', 'Ponta Porã'],
  ['MS', '5005707', 'Naviraí'],
  ['MS', '5006200', 'Nova Andradina'],
  ['MS', '5007901', 'Sidrolândia'],
  ['MS', '5001102', 'Aquidauana'],
  ['MS', '5005400', 'Maracaju'],
  ['MS', '5006309', 'Paranaíba'],
  ['MS', '5000609', 'Amambai'],
  ['MS', '5007208', 'Rio Brilhante'],
  ['MS', '5003306', 'Coxim'],
  ['MS', '5002951', 'Chapadão do Sul'],
  ['MT', '5103403', 'Cuiabá'],
  ['MT', '5108402', 'Várzea Grande'],
  ['MT', '5107602', 'Rondonópolis'],
  ['MT', '5107909', 'Sinop'],
  ['MT', '5107925', 'Sorriso'],
  ['MT', '5107958', 'Tangará da Serra'],
  ['MT', '5102504', 'Cáceres'],
  ['MT', '5107040', 'Primavera do Leste'],
  ['MT', '5105259', 'Lucas do Rio Verde'],
  ['MT', '5101803', 'Barra do Garças'],
  ['MT', '5100250', 'Alta Floresta'],
  ['MT', '5106224', 'Nova Mutum'],
  ['MT', '5106752', 'Pontes e Lacerda'],
  ['MT', '5102637', 'Campo Novo do Parecis'],
  ['MT', '5105150', 'Juína'],
  ['PA', '1501402', 'Belém'],
  ['PA', '1500800', 'Ananindeua'],
  ['PA', '1506807', 'Santarém'],
  ['PA', '1505536', 'Parauapebas'],
  ['PA', '1504208', 'Marabá'],
  ['PA', '1502400', 'Castanhal'],
  ['PA', '1500107', 'Abaetetuba'],
  ['PA', '1502103', 'Cametá'],
  ['PA', '1501303', 'Barcarena'],
  ['PA', '1500602', 'Altamira'],
  ['PA', '1503606', 'Itaituba'],
  ['PA', '1501709', 'Bragança'],
  ['PA', '1504422', 'Marituba'],
  ['PA', '1501808', 'Breves'],
  ['PA', '1505502', 'Paragominas'],
  ['PB', '2507507', 'João Pessoa'],
  ['PB', '2504009', 'Campina Grande'],
  ['PB', '2513703', 'Santa Rita'],
  ['PB', '2510808', 'Patos'],
  ['PB', '2501807', 'Bayeux'],
  ['PB', '2516201', 'Sousa'],
  ['PB', '2503209', 'Cabedelo'],
  ['PB', '2503704', 'Cajazeiras'],
  ['PB', '2506301', 'Guarabira'],
  ['PB', '2515302', 'Sapé'],
  ['PB', '2512507', 'Queimadas'],
  ['PB', '2508901', 'Mamanguape'],
  ['PB', '2512101', 'Pombal'],
  ['PB', '2509701', 'Monteiro'],
  ['PB', '2513901', 'São Bento'],
  ['PE', '2611606', 'Recife'],
  ['PE', '2607901', 'Jaboatão dos Guararapes'],
  ['PE', '2611101', 'Petrolina'],
  ['PE', '2604106', 'Caruaru'],
  ['PE', '2609600', 'Olinda'],
  ['PE', '2610707', 'Paulista'],
  ['PE', '2602902', 'Cabo de Santo Agostinho'],
  ['PE', '2603454', 'Camaragibe'],
  ['PE', '2606002', 'Garanhuns'],
  ['PE', '2616407', 'Vitória de Santo Antão'],
  ['PE', '2606804', 'Igarassu'],
  ['PE', '2613701', 'São Lourenço da Mata'],
  ['PE', '2607208', 'Ipojuca'],
  ['PE', '2600054', 'Abreu e Lima'],
  ['PE', '2612505', 'Santa Cruz do Capibaribe'],
  ['PI', '2211001', 'Teresina'],
  ['PI', '2207702', 'Parnaíba'],
  ['PI', '2208007', 'Picos'],
  ['PI', '2208403', 'Piripiri'],
  ['PI', '2203909', 'Floriano'],
  ['PI', '2201200', 'Barras'],
  ['PI', '2200400', 'Altos'],
  ['PI', '2211100', 'União'],
  ['PI', '2202208', 'Campo Maior'],
  ['PI', '2205508', 'José de Freitas'],
  ['PI', '2203701', 'Esperantina'],
  ['PI', '2210607', 'São Raimundo Nonato'],
  ['PI', '2207009', 'Oeiras'],
  ['PI', '2207900', 'Pedro II'],
  ['PI', '2206209', 'Miguel Alves'],
  ['PR', '4106902', 'Curitiba'],
  ['PR', '4113700', 'Londrina'],
  ['PR', '4115200', 'Maringá'],
  ['PR', '4119905', 'Ponta Grossa'],
  ['PR', '4104808', 'Cascavel'],
  ['PR', '4125506', 'São José dos Pinhais'],
  ['PR', '4108304', 'Foz do Iguaçu'],
  ['PR', '4105805', 'Colombo'],
  ['PR', '4109401', 'Guarapuava'],
  ['PR', '4101804', 'Araucária'],
  ['PR', '4127700', 'Toledo'],
  ['PR', '4107652', 'Fazenda Rio Grande'],
  ['PR', '4118204', 'Paranaguá'],
  ['PR', '4104204', 'Campo Largo'],
  ['PR', '4101408', 'Apucarana'],
  ['RJ', '3304557', 'Rio de Janeiro'],
  ['RJ', '3304904', 'São Gonçalo'],
  ['RJ', '3301702', 'Duque de Caxias'],
  ['RJ', '3303500', 'Nova Iguaçu'],
  ['RJ', '3301009', 'Campos dos Goytacazes'],
  ['RJ', '3300456', 'Belford Roxo'],
  ['RJ', '3303302', 'Niterói'],
  ['RJ', '3305109', 'São João de Meriti'],
  ['RJ', '3303906', 'Petrópolis'],
  ['RJ', '3306305', 'Volta Redonda'],
  ['RJ', '3302403', 'Macaé'],
  ['RJ', '3302502', 'Magé'],
  ['RJ', '3301900', 'Itaboraí'],
  ['RJ', '3300704', 'Cabo Frio'],
  ['RJ', '3302700', 'Maricá'],
  ['RN', '2408102', 'Natal'],
  ['RN', '2408003', 'Mossoró'],
  ['RN', '2403251', 'Parnamirim'],
  ['RN', '2412005', 'São Gonçalo do Amarante'],
  ['RN', '2407104', 'Macaíba'],
  ['RN', '2402600', 'Ceará-Mirim'],
  ['RN', '2403608', 'Extremoz'],
  ['RN', '2402006', 'Caicó'],
  ['RN', '2400208', 'Assú'],
  ['RN', '2412203', 'São José de Mipibu'],
  ['RN', '2403103', 'Currais Novos'],
  ['RN', '2411205', 'Santa Cruz'],
  ['RN', '2401008', 'Apodi'],
  ['RN', '2408300', 'Nova Cruz'],
  ['RN', '2405801', 'João Câmara'],
  ['RO', '1100205', 'Porto Velho'],
  ['RO', '1100122', 'Ji-Paraná'],
  ['RO', '1100023', 'Ariquemes'],
  ['RO', '1100304', 'Vilhena'],
  ['RO', '1100049', 'Cacoal'],
  ['RO', '1100288', 'Rolim de Moura'],
  ['RO', '1100114', 'Jaru'],
  ['RO', '1100106', 'Guajará-Mirim'],
  ['RO', '1100189', 'Pimenta Bueno'],
  ['RO', '1100155', 'Ouro Preto do Oeste'],
  ['RO', '1100130', "Machadinho D'Oeste"],
  ['RO', '1100098', "Espigão D'Oeste"],
  ['RO', '1100452', 'Buritis'],
  ['RO', '1100338', 'Nova Mamoré'],
  ['RO', '1100809', 'Candeias do Jamari'],
  ['RR', '1400100', 'Boa Vista'],
  ['RR', '1400472', 'Rorainópolis'],
  ['RR', '1400050', 'Alto Alegre'],
  ['RR', '1400209', 'Caracaraí'],
  ['RR', '1400456', 'Pacaraima'],
  ['RR', '1400175', 'Cantá'],
  ['RR', '1400308', 'Mucajaí'],
  ['RR', '1400407', 'Normandia'],
  ['RR', '1400027', 'Amajari'],
  ['RR', '1400159', 'Bonfim'],
  ['RR', '1400704', 'Uiramutã'],
  ['RR', '1400233', 'Caroebe'],
  ['RR', '1400282', 'Iracema'],
  ['RR', '1400506', 'São João da Baliza'],
  ['RR', '1400605', 'São Luiz do Anauá'],
  ['RS', '4314902', 'Porto Alegre'],
  ['RS', '4305108', 'Caxias do Sul'],
  ['RS', '4304606', 'Canoas'],
  ['RS', '4314407', 'Pelotas'],
  ['RS', '4316907', 'Santa Maria'],
  ['RS', '4309209', 'Gravataí'],
  ['RS', '4313409', 'Novo Hamburgo'],
  ['RS', '4323002', 'Viamão'],
  ['RS', '4318705', 'São Leopoldo'],
  ['RS', '4314100', 'Passo Fundo'],
  ['RS', '4315602', 'Rio Grande'],
  ['RS', '4300604', 'Alvorada'],
  ['RS', '4303103', 'Cachoeirinha'],
  ['RS', '4316808', 'Santa Cruz do Sul'],
  ['RS', '4320008', 'Sapucaia do Sul'],
  ['SC', '4209102', 'Joinville'],
  ['SC', '4205407', 'Florianópolis'],
  ['SC', '4202404', 'Blumenau'],
  ['SC', '4216602', 'São José'],
  ['SC', '4208203', 'Itajaí'],
  ['SC', '4204202', 'Chapecó'],
  ['SC', '4211900', 'Palhoça'],
  ['SC', '4204608', 'Criciúma'],
  ['SC', '4208906', 'Jaraguá do Sul'],
  ['SC', '4209300', 'Lages'],
  ['SC', '4202909', 'Brusque'],
  ['SC', '4202008', 'Balneário Camboriú'],
  ['SC', '4218707', 'Tubarão'],
  ['SC', '4203204', 'Camboriú'],
  ['SC', '4211306', 'Navegantes'],
  ['SE', '2800308', 'Aracaju'],
  ['SE', '2804805', 'Nossa Senhora do Socorro'],
  ['SE', '2802908', 'Itabaiana'],
  ['SE', '2803500', 'Lagarto'],
  ['SE', '2806701', 'São Cristóvão'],
  ['SE', '2802106', 'Estância'],
  ['SE', '2807402', 'Tobias Barreto'],
  ['SE', '2807105', 'Simão Dias'],
  ['SE', '2800605', 'Barra dos Coqueiros'],
  ['SE', '2804508', 'Nossa Senhora da Glória'],
  ['SE', '2803005', 'Itabaianinha'],
  ['SE', '2803203', "Itaporanga d'Ajuda"],
  ['SE', '2805406', 'Poço Redondo'],
  ['SE', '2801306', 'Capela'],
  ['SE', '2801207', 'Canindé de São Francisco'],
  ['SP', '3550308', 'São Paulo'],
  ['SP', '3518800', 'Guarulhos'],
  ['SP', '3509502', 'Campinas'],
  ['SP', '3548708', 'São Bernardo do Campo'],
  ['SP', '3547809', 'Santo André'],
  ['SP', '3534401', 'Osasco'],
  ['SP', '3552205', 'Sorocaba'],
  ['SP', '3543402', 'Ribeirão Preto'],
  ['SP', '3549904', 'São José dos Campos'],
  ['SP', '3549805', 'São José do Rio Preto'],
  ['SP', '3530607', 'Mogi das Cruzes'],
  ['SP', '3525904', 'Jundiaí'],
  ['SP', '3538709', 'Piracicaba'],
  ['SP', '3548500', 'Santos'],
  ['SP', '3529401', 'Mauá'],
  ['TO', '1721000', 'Palmas'],
  ['TO', '1702109', 'Araguaína'],
  ['TO', '1709500', 'Gurupi'],
  ['TO', '1718204', 'Porto Nacional'],
  ['TO', '1716109', 'Paraíso do Tocantins'],
  ['TO', '1705508', 'Colinas do Tocantins'],
  ['TO', '1702208', 'Araguatins'],
  ['TO', '1709302', 'Guaraí'],
  ['TO', '1721208', 'Tocantinópolis'],
  ['TO', '1708205', 'Formoso do Araguaia'],
  ['TO', '1713205', 'Miracema do Tocantins'],
  ['TO', '1707009', 'Dianópolis'],
  ['TO', '1702554', 'Augustinópolis'],
  ['TO', '1711902', 'Lagoa da Confusão'],
  ['TO', '1716505', 'Pedro Afonso'],
] as const;

const serializeStates = (): string =>
  JSON.stringify(brazilianStates.map(([code, name]) => ({ code, name })));

const serializeCities = (): string =>
  JSON.stringify(brazilianCities.map(([uf, ibgeCode, name]) => ({ ibgeCode, name, uf })));

export class CoreSeedGeography1792142000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const states = serializeStates();
    const cities = serializeCities();
    const languages = (await queryRunner.query(`
      SELECT "id", "codigo_idioma"
      FROM "idiomas"
      WHERE "codigo_idioma" = ANY(ARRAY['pt', 'en', 'es'])
    `)) as Array<{ codigo_idioma: string; id: number }>;

    if (languages.length !== 3) {
      throw new Error('Core geography seed requires the three baseline languages.');
    }

    const countries = (await queryRunner.query(`
      INSERT INTO "paises"
        ("iso2", "iso3", "codigo_telefone", "codigo_moeda", "locale", "eh_ativo")
      VALUES ('BR', 'BRA', '55', 'BRL', 'pt-BR', true)
      RETURNING "id"
    `)) as Array<{ id: number }>;
    const country = countries[0];

    if (!country) {
      throw new Error('Core geography seed could not create Brazil.');
    }

    await queryRunner.query(
      `
        INSERT INTO "paises_traducoes" ("pais_id", "idioma_id", "nome")
        SELECT $1, language."id", names."name"
        FROM (VALUES ('pt', 'Brasil'), ('en', 'Brazil'), ('es', 'Brasil'))
          AS names("code", "name")
        JOIN "idiomas" language ON language."codigo_idioma" = names."code"
      `,
      [country.id],
    );

    const insertedStates = (await queryRunner.query(
      `
        INSERT INTO "estados" ("pais_id", "codigo", "eh_ativo")
        SELECT $1, data."code", true
        FROM jsonb_to_recordset($2::jsonb) AS data("code" text, "name" text)
        RETURNING "id"
      `,
      [country.id, states],
    )) as Array<{ id: number }>;

    if (insertedStates.length !== brazilianStates.length) {
      throw new Error('Core geography seed did not create the expected states.');
    }

    await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb) AS data("code" text, "name" text)
        )
        INSERT INTO "estados_traducoes" ("estado_id", "idioma_id", "nome")
        SELECT state."id", language."id", seed."name"
        FROM seed
        JOIN "estados" state
          ON state."pais_id" = $2
          AND state."codigo" = seed."code"
        CROSS JOIN "idiomas" language
        WHERE language."codigo_idioma" = ANY(ARRAY['pt', 'en', 'es'])
      `,
      [states, country.id],
    );

    const insertedCities = (await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text)
        )
        INSERT INTO "cidades" ("estado_id", "codigo_ibge", "eh_ativo")
        SELECT state."id", seed."ibgeCode", true
        FROM seed
        JOIN "estados" state
          ON state."pais_id" = $2
          AND state."codigo" = seed."uf"
        RETURNING "id"
      `,
      [cities, country.id],
    )) as Array<{ id: number }>;

    if (insertedCities.length !== brazilianCities.length) {
      throw new Error('Core geography seed did not create the expected cities.');
    }

    await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text)
        )
        INSERT INTO "cidades_traducoes" ("cidade_id", "idioma_id", "nome")
        SELECT city."id", language."id", seed."name"
        FROM seed
        JOIN "cidades" city ON city."codigo_ibge" = seed."ibgeCode"
        CROSS JOIN "idiomas" language
        WHERE language."codigo_idioma" = ANY(ARRAY['pt', 'en', 'es'])
      `,
      [cities],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const states = serializeStates();
    const cities = serializeCities();
    const validation = (await queryRunner.query(
      `
        WITH state_seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb) AS data("code" text, "name" text)
        ),
        city_seed AS (
          SELECT *
          FROM jsonb_to_recordset($2::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text)
        )
        SELECT
          (
            SELECT COUNT(*)::integer
            FROM "paises" country
            WHERE country."iso2" = 'BR'
              AND country."iso3" = 'BRA'
              AND country."codigo_telefone" = '55'
              AND country."codigo_moeda" = 'BRL'
              AND country."locale" = 'pt-BR'
              AND country."eh_ativo" = true
              AND (
                SELECT COUNT(*)
                FROM "paises_traducoes" translation
                JOIN "idiomas" language ON language."id" = translation."idioma_id"
                WHERE translation."pais_id" = country."id"
                  AND translation."nome" = CASE language."codigo_idioma"
                    WHEN 'en' THEN 'Brazil'
                    WHEN 'pt' THEN 'Brasil'
                    WHEN 'es' THEN 'Brasil'
                  END
              ) = 3
              AND (
                SELECT COUNT(*)
                FROM "paises_traducoes" translation
                WHERE translation."pais_id" = country."id"
              ) = 3
          ) AS "validCountries",
          (
            SELECT COUNT(*)::integer
            FROM state_seed
            JOIN "paises" country ON country."iso2" = 'BR'
            JOIN "estados" state
              ON state."pais_id" = country."id"
              AND state."codigo" = state_seed."code"
            WHERE state."eh_ativo" = true
              AND (
                SELECT COUNT(*)
                FROM "estados_traducoes" translation
                WHERE translation."estado_id" = state."id"
                  AND translation."nome" = state_seed."name"
              ) = 3
              AND (
                SELECT COUNT(*)
                FROM "estados_traducoes" translation
                WHERE translation."estado_id" = state."id"
              ) = 3
          ) AS "validStates",
          (
            SELECT COUNT(*)::integer
            FROM city_seed
            JOIN "cidades" city ON city."codigo_ibge" = city_seed."ibgeCode"
            JOIN "estados" state
              ON state."id" = city."estado_id"
              AND state."codigo" = city_seed."uf"
            WHERE city."eh_ativo" = true
              AND (
                SELECT COUNT(*)
                FROM "cidades_traducoes" translation
                WHERE translation."cidade_id" = city."id"
                  AND translation."nome" = city_seed."name"
              ) = 3
              AND (
                SELECT COUNT(*)
                FROM "cidades_traducoes" translation
                WHERE translation."cidade_id" = city."id"
              ) = 3
          ) AS "validCities",
          (SELECT COUNT(*)::integer
            FROM "estados" state
            JOIN "paises" country ON country."id" = state."pais_id"
            WHERE country."iso2" = 'BR') AS "totalStates",
          (SELECT COUNT(*)::integer
            FROM "cidades" city
            JOIN "estados" state ON state."id" = city."estado_id"
            JOIN "paises" country ON country."id" = state."pais_id"
            WHERE country."iso2" = 'BR') AS "totalCities",
          (
            SELECT COUNT(*)::integer
            FROM "clientes" client
            JOIN "cidades" city ON city."id" = client."cidade_id"
            JOIN city_seed ON city_seed."ibgeCode" = city."codigo_ibge"
          ) AS "clientReferences"
      `,
      [states, cities],
    )) as Array<{
      clientReferences: number;
      validCities: number;
      validCountries: number;
      validStates: number;
      totalCities: number;
      totalStates: number;
    }>;
    const result = validation[0];

    if (
      !result ||
      Number(result.validCountries) !== 1 ||
      Number(result.validStates) !== brazilianStates.length ||
      Number(result.totalStates) !== brazilianStates.length ||
      Number(result.validCities) !== brazilianCities.length ||
      Number(result.totalCities) !== brazilianCities.length
    ) {
      throw new Error('Cannot revert Core geography seed after seeded data was changed.');
    }

    if (Number(result.clientReferences) > 0) {
      throw new Error('Cannot revert Core geography seed while seeded cities are in use.');
    }

    await queryRunner.query(
      `
        DELETE FROM "cidades"
        WHERE "codigo_ibge" IN (
          SELECT data."ibgeCode"
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text)
        )
      `,
      [cities],
    );
    await queryRunner.query(
      `
        DELETE FROM "estados"
        WHERE "pais_id" = (SELECT "id" FROM "paises" WHERE "iso2" = 'BR')
          AND "codigo" IN (
            SELECT data."code"
            FROM jsonb_to_recordset($1::jsonb) AS data("code" text, "name" text)
          )
      `,
      [states],
    );
    await queryRunner.query(`DELETE FROM "paises" WHERE "iso2" = 'BR'`);
  }
}
