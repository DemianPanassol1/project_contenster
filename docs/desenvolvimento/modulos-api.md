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

## Persistência e testes

Migrations são append-only após aplicação e `synchronize` permanece desativado. Use transação quando
uma invariante abranger mais de um registro. As regras arquiteturais pertencem a
[Persistência](../arquitetura/persistencia.md).

Escolha testes pela fronteira exercitada: regra isolada em unitário, persistência em integração e
HTTP/guards/contexto em e2e. Consulte [Testes](./testes.md) antes de criar ou executar suítes que
dependam do ambiente descartável.
