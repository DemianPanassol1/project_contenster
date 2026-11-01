# Módulos da API

## Padrão observado

Os recursos ficam em `apps/api/src/modules`, agrupados por domínio. Módulos como clientes, usuários,
países, estados, cidades, perfis, módulos e funcionalidades usam uma estrutura local que pode conter
`controller`, `service`, `repository`, `entities` e `dto/req` e `dto/res`, além de helpers quando
necessários à responsabilidade do recurso.

O `*.module.ts` compõe entidades, serviços e dependências. O controller adapta HTTP e declara os
decorators de rota e permissão. O service coordena validação de domínio, contexto, transações e
conversão para response DTOs. Repositories concentram consultas, filtros, paginação e persistência.

Nem todo módulo tem a mesma estrutura: autenticação, armazenamento, tarefas agendadas e portal
público possuem responsabilidades próprias. Não force um recurso a adotar diretórios que não
resolvam uma necessidade real.

## Estrutura representativa

**Convenção recomendada:** recursos CRUD com entidade, payload público e persistência própria tendem
a usar a estrutura abaixo. Ela é representativa do módulo de módulos administrativos; `entities`,
`dto` ou `repository` são elementos opcionais quando a responsabilidade do recurso não os exige.

```text
apps/api/src/modules/<domain>/<resource>/
├── dto/
│   ├── req/
│   │   └── save-<resource>-request.ts
│   └── res/
│       ├── get-<resource>-by-id-response.ts
│       └── <resource>-list-item-response.ts
├── entities/
│   ├── <resource>.entity.ts
│   └── <resource>-translation.entity.ts
├── <resource>.controller.ts
├── <resource>.module.ts
├── <resource>.repository.ts
└── <resource>.service.ts
```

- `controller` recebe o request e delega; não concentra regra de negócio.
- `service` aplica contexto, valida relações e decide exceções de domínio.
- `repository` encapsula consultas e comandos de persistência.
- `dto/req` e `dto/res` representam a fronteira HTTP; `entities` pertencem à persistência.
- `module` declara as dependências reais do recurso, incluindo entidades e módulos importados.

## Exemplo ilustrativo: controller protegido

O trecho abaixo reproduz a separação usada pelo CRUD de módulos. **Regra obrigatória:** uma rota de
cliente deve receber o contexto confiável, e não um identificador de cliente informado pelo corpo.

```typescript
const { modules } = CORE_FUNCTIONALITY_IDENTITIES;

@Post('list')
@RequirePermission(modules, ActionType.view)
list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
  return this.service.list(clientId, request);
}

@Post()
@RequirePermission(modules, ActionType.create, {
  bodyIdField: 'id',
  updateActionType: ActionType.edit,
})
save(@CurrentClientId() clientId: number, @Body() request: SaveSystemModuleRequestDto) {
  return this.service.save(clientId, request);
}
```

O decorator comunica a permissão HTTP. O service ainda deve limitar buscas e gravações por
`clientId`, validar relações e lançar a exceção de domínio adequada. Este exemplo não é um modelo
para rotas públicas ou administrativas globais, que têm contexto e autorização próprios.

## DTOs, contratos e validação

Requests ficam em `dto/req` e responses em `dto/res`. DTOs usam transformação e validação na
fronteira HTTP, descrevem o payload no Swagger e implementam contratos do Shared quando esses
contratos existem. Respostas públicas não retornam entidades TypeORM diretamente.

As regras detalhadas de `null`, `undefined`, `declare`, transformers e serialização estão em
[Nulidade e inicialização](./nulidade-e-inicializacao.md) e nas [Convenções](./convencoes.md).

## Exemplo ilustrativo: contrato e DTO

Um contrato permanece no Shared; a DTO adiciona apenas o comportamento da fronteira HTTP. A forma
abaixo é reduzida a partir de `SaveSystemModuleRequestDto`:

```typescript
export interface SaveExampleRequest {
  id: number | null;
  isActive: boolean;
}

export class SaveExampleRequestDto implements SaveExampleRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;
}
```

**Regra obrigatória:** decorators, transformação e Swagger ficam na API; a interface sem framework
permanece no Shared. O exemplo é ilustrativo e não substitui os decorators necessários para os
campos reais do recurso.

## Segurança e contexto

Controllers protegidos declaram a funcionalidade e ação requeridas. A autorização efetiva não se
encerra no decorator: serviços usam o contexto autenticado confiável para limitar dados de cliente e
validar relações de domínio. `clientId`, perfil ou permissão vindos do request não provam acesso.

Rotas públicas e recursos globais têm regras próprias; não os trate como CRUD de cliente apenas por
terem controller e service. Para a fonte normativa, consulte
[Identidade, RBAC e contexto](../arquitetura/identidade-rbac-e-contexto.md).

## CRUD administrativo recorrente

Nos cadastros administrativos que seguem o padrão existente, as operações são listagem paginada,
detalhe, salvamento e exclusão. A listagem usa `PaginateRequestDto`; o detalhe e as respostas são
convertidos por DTOs; criação e edição podem compartilhar uma rota de salvamento quando a regra de
autorização diferencia a ação pelo identificador. Esse padrão não substitui a investigação do módulo
equivalente mais próximo.

## Services: fluxo, reuso e legibilidade

**Regra obrigatória:** o service coordena o caso de uso. Ele obtém o contexto confiável recebido do
controller, carrega relações, verifica invariantes, monta o agregado para persistência, converte a
resposta e dispara efeitos técnicos necessários. Query SQL, paginação e detalhes de `QueryBuilder`
permanecem no repository.

Antes de criar lógica nova, procure primeiro helpers em `apps/api/src/shared` e `apps/shared`. O
checkout já possui `getCurrentLocale`, `resolveTranslation`, `resolveTranslationLanguages`,
`toResponseDto`, `buildPaginationMeta`, `normalizeDeleteRecordIds` e contratos compartilhados.
Reimplementar esses comportamentos em um módulo cria divergência de validação, fallback, paginação
ou serialização.

**Convenção recomendada de espaçamento:** separe constantes de módulo, blocos de dependências,
métodos e etapas de um método por linhas em branco. Dentro de um fluxo, consulta, verificação,
transformação, persistência e retorno devem formar blocos visuais distintos. `if`, `else`, `for`,
`while` e retornos de guarda não devem ficar amontoados com a instrução anterior ou seguinte quando
isso esconder uma mudança de etapa.

```typescript
async getById(clientId: number, id: number): Promise<GetExampleByIdResponseDto> {
  const entity = await this.repository.findById(clientId, id);

  if (!entity) {
    throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
  }

  const locale = getCurrentLocale();

  return toResponseDto(GetExampleByIdResponseDto, this.toListItem(entity, locale));
}
```

O exemplo é ilustrativo, mas reflete o fluxo usado pelos services administrativos. A linha em branco
deve separar responsabilidades reais, sem fragmentar uma operação coesa em métodos artificiais.

### Abstrações proporcionais

**Regra obrigatória:** não crie helpers, classes, serviços auxiliares ou wrappers genéricos apenas
para reduzir linhas ou extrair um trecho usado uma vez. Prefira um fluxo local e legível quando a
etapa não possui responsabilidade independente.

Uma função privada é adequada quando expressa uma responsabilidade reconhecível ou evita repetição
real — por exemplo, `getEntityByIdOrFail` e `toListItem` nos módulos administrativos. Ela não é
justificada para encapsular uma única atribuição, uma única chamada de repository ou um `if` que
permanece mais claro no fluxo do caso de uso. Antes de extrair, procure equivalente no módulo,
`apps/api/src/shared` e `apps/shared`.

## Listagem, salvamento e traduções

### Listagem paginada no service

O service solicita o locale uma vez, delega a consulta ao repository e retorna itens serializados
com metadados. **Regra obrigatória:** não calcule `page`, `perPage` ou `totalPages` manualmente;
use `buildPaginationMeta`.

```typescript
async list(
  clientId: number,
  request: PaginateRequestDto,
): Promise<PaginatedBody<ExampleListItemResponseDto>> {
  const locale = getCurrentLocale();
  const [items, total] = await this.repository.list(clientId, request, locale);

  return {
    items: toResponseDto(
      ExampleListItemResponseDto,
      items.map((item) => this.toListItem(item, locale)),
    ),
    meta: buildPaginationMeta(request, total),
  };
}
```

O `toListItem` é apropriado quando a mesma projeção é reutilizada por listagem e detalhe. Se a
projeção for consumida uma única vez e não melhorar a leitura, mantenha-a no método.

### Salvamento e traduções

Em um `save`, valide primeiro o recurso existente quando houver `id`, depois resolva relações e
idiomas, monte o agregado, persista e retorne a leitura normalizada. Para traduções, o request leva
`id: number | null`: identificador existente atualiza o filho; `null` cria um novo. Não reconstrua
IDs por locale no repository nem substitua a coleção por `DELETE` global seguido de inserções.

```typescript
const languages = await this.repository.findLanguagesByCodes(
  request.translations.map((translation) => translation.locale),
);

const languageByCode = resolveTranslationLanguages(
  request.translations.map((translation) => translation.locale),
  languages,
);

const entity = await this.repository.save({
  ...(request.id === null ? {} : { id: request.id }),
  client: { id: clientId },
  translations: request.translations.map((translation) => ({
    ...(translation.id === null ? {} : { id: translation.id }),
    language: languageByCode.get(translation.locale)!,
    name: translation.name,
  })),
});

return this.getById(clientId, entity.id);
```

O trecho é reduzido a partir do salvamento de módulos. Relações, campos e efeitos posteriores
variam por recurso; por exemplo, mudanças que alteram autorização ou apresentação de sessão podem
exigir a sincronização central de sessões já existente.

### Resolução de traduções no service

Use `getCurrentLocale()` para obter o idioma da requisição e `resolveTranslation()` para apresentar
um campo localizado, preservando o fallback centralizado. Não repita a busca de tradução nem escolha
manualmente o primeiro item da coleção.

```typescript
private toListItem(entity: Example, locale: string) {
  return {
    id: entity.id,
    name: resolveTranslation(entity.translations, locale, 'name'),
    description: resolveTranslation(entity.translations, locale, 'description'),
  };
}
```

Para relacionamentos localizados, carregue no repository as traduções necessárias e aplique o mesmo
helper no service. A listagem de cidades é a referência para cidade, estado e país traduzidos.

## Repositories: consultas e persistência

**Regra obrigatória:** repositories concentram `QueryBuilder`, relações necessárias para a consulta,
whitelist de campos, paginação, filtros, ordenação e comandos de persistência. Eles não decidem
exceção de negócio, autorização HTTP ou mensagem localizada; essas responsabilidades pertencem ao
service e ao contexto autenticado.

### Paginação, filtros e ordenação

Para uma listagem paginada, declare um `QueryFieldMap` local, crie a query com seus joins e delegue
as operações do contrato a `applyPaginatedQueryBuilder`. Os nomes expostos ao consumidor são as
chaves da whitelist, não expressões SQL recebidas pelo request.

```typescript
const LIST_FIELDS: QueryFieldMap = {
  id: 'example.id',
  isActive: 'example.eh_ativo',
  name: nameExpression,
};

return applyPaginatedQueryBuilder<Example>(query, request, {
  defaultSort: [{ field: 'name', direction: 'asc' }],
  fields: LIST_FIELDS,
  tieBreaker: 'example.id',
});
```

O helper aceita somente campos declarados, ignora filtros e ordenações não permitidos, aplica
parâmetros vinculados, usa paginação baseada em página um e acrescenta o critério estável indicado
em `tieBreaker`. Não replique essa lógica com `skip`, `take`, `andWhere` e `orderBy` ad hoc em cada
repository.

### Campos traduzidos em filtros e ordenação

Quando um campo de lista é localizado, a expressão usada em `LIST_FIELDS` deve ser produzida por
`buildTranslatedLabelExpression`, e a query deve receber
`buildTranslationQueryParameters(locale)`. Assim, o mesmo valor localizado pode ser exibido,
filtrado e ordenado sem SQL copiado entre módulos.

```typescript
const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'modulo_id',
  ownerExpression: 'module.id',
  table: 'modulos_traducoes',
  uniqueAlias: 'module_name',
});

const query = this.modules
  .createQueryBuilder('module')
  .leftJoinAndSelect('module.translations', 'translations')
  .leftJoinAndSelect('translations.language', 'translationLanguage')
  .where('module.cliente_id = :clientId', { clientId })
  .setParameters(buildTranslationQueryParameters(locale));
```

Os identificadores de tabela, coluna e alias devem corresponder à entidade e migration reais. Para
relações traduzidas adicionais, como estado e país na listagem de cidades, carregue cada coleção e
linguagem necessária antes de resolver seus campos; não suponha que o join da tradução principal
cubra suas relações.

### Persistência do agregado

O repository recebe o agregado já validado pelo service e o persiste com o mecanismo existente,
como `Repository.save`. Ele não consulta novamente a coleção filha para deduzir identidade, não
aplica regra de domínio em silêncio e não substitui filhos por exclusão global. Quando uma operação
envolver múltiplos agregados ou uma invariante multi-registro, o service deve coordenar a transação
e compartilhar o `EntityManager` apropriado.

## Persistência e testes

Migrations são append-only após aplicação e `synchronize` permanece desativado. Use transação quando
uma invariante abranger mais de um registro. As regras arquiteturais pertencem a
[Persistência](../arquitetura/persistencia.md).

Escolha testes pela fronteira exercitada: regra isolada em unitário, persistência em integração e
HTTP/guards/contexto em e2e. Consulte [Testes](./testes.md) antes de criar ou executar suítes que
dependam do ambiente descartável.
