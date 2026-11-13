# Extensibilidade

## Objetivo e limite

O Slim Core é um template independente. Uma aplicação derivada nasce a partir de uma cópia do
repositório e evolui no próprio código; não há plugins instalados em runtime, sincronização de
código com a origem, nem catálogo de produtos habilitável por cliente.

Uma derivação pode adicionar capacidades próprias e especializar capacidades do Core sem alterar a
responsabilidade dos recursos-base. O objetivo é manter essa evolução explícita, tipada e
transacional, não criar pontos de extensão genéricos para cenários hipotéticos.

## Organização da aplicação derivada

Os recursos da derivação são irmãos de `core` na API e no Web:

```text
apps/api/src/modules/
├── core/
└── <application>/
    └── <domain>/<resource>/

apps/web/src/features/
├── core/
├── shared/
└── <application>/
    └── admin/<resource>/
```

O `AppModule` da derivação importa o módulo da aplicação explicitamente. Não crie um
`ApplicationModule` vazio no template somente para antecipar uma derivação. O módulo passa a existir
quando houver uma capacidade concreta para compor.

Uma feature derivada pode adicionar um binding administrativo novo ou substituir explicitamente a
view de um slug do Core. Ela não altera a feature-base silenciosamente nem depende de imports
relativos para dentro de outra feature.

## Fronteira entre módulos API

Repositories são detalhes de persistência do recurso proprietário. Outro módulo — inclusive um
módulo de aplicação derivada — não importa nem injeta repositories estrangeiros. O módulo expõe um
service somente quando existe uma capacidade real a ser consumida.

```text
controller -> service proprietário -> repository proprietário
aplicação  -> service público do Core -> repository proprietário
```

Entidades do Core podem ser referenciadas por entidades da aplicação para declarar relações
persistentes, como `UserComplement.user`. Isso não autoriza a aplicação a persistir agregados do
Core por `EntityManager` ou repository próprio.

### Operações compostas

Quando uma regra da aplicação abrange um agregado Core e sua própria entidade, o Core oferece uma
operação de domínio transacional e continua dono das suas validações. O service da aplicação abre a
transação, coordena a ordem e encaminha o mesmo `EntityManager` aos services/repositories
proprietários.

```text
ApplicationUsersService
  └─ DataSource.transaction(manager)
      ├─ UsersService.saveInTransaction(input, manager)
      └─ UserComplementRepository.save(complement, manager)

após o commit
  └─ UsersService.synchronizeMutation()
```

`saveInTransaction` recebe um input de domínio tipado pelo módulo proprietário e retorna somente o
resultado necessário à composição. O service convencional do Core reutiliza a mesma operação e
executa seus efeitos posteriores após o commit.

Não adicione `saveInTransaction` a todo service. Ele é apropriado quando uma extensão ou um caso de
uso existente precisa preservar uma invariante em mais de uma tabela ou agregado. Consultas de
referência, infraestrutura, catálogo estático e operações sem composição permanecem fechados.

### Capacidades públicas atuais

| Capacidade                                                               | Fronteira de derivação                                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Usuários                                                                 | `UsersService.saveInTransaction(...)` e `synchronizeMutation()` para complementos de usuário.                          |
| Clientes                                                                 | `ClientsService.saveInTransaction(...)` e `synchronizeMutation()` para composição de cadastro/provisionamento.         |
| Perfil administrador                                                     | `ProfilesService.saveAdminProfileInTransaction(...)`, específico para o perfil inicial imutável.                       |
| Armazenamento do cliente                                                 | `ClientStorageService` expõe operações transacionais para configurações e regras.                                      |
| Arquivos                                                                 | `FileService` é a fronteira de upload e consulta; upload em storage externo não participa de transação relacional.     |
| Módulos e funcionalidades                                                | A extensão ocorre no catálogo estático, seed e modelo de acesso; não há cadastro dinâmico de capacidades da aplicação. |
| Autenticação, autorização, observabilidade, agendamento e portal público | Permanecem capacidades técnicas fechadas, exceto APIs públicas já necessárias a um consumidor concreto.                |

## Shared, catálogo e seed

Cada derivação compõe seu catálogo de funcionalidades em cima do catálogo Core. A identidade
derivada entra no `FunctionalitySlug` combinado; controllers usam essa identidade em
`RequirePermission`, e o registry administrativo usa o mesmo tipo para o binding Web.

O catálogo continua sendo apenas a identidade técnica da funcionalidade. Uma derivação também deve:

1. incluir módulo, funcionalidades, ícones, ordem e traduções no seed ou modelo de acesso aplicável;
2. registrar a feature Web e suas rotas protegidas;
3. declarar endpoints e contratos Shared próprios quando houver fronteira HTTP nova;
4. conceder ações por perfis persistidos conforme o modelo aplicado ao cliente.

Não use o catálogo para persistir permissões, inferir rotas, criar componentes ou habilitar uma
capacidade automaticamente para todos os clientes.

## Exemplo fictício ponta a ponta: complemento de usuário

Considere uma aplicação derivada `logistics` que precisa associar um código operacional ao vínculo
de um usuário com um cliente. O exemplo especializa o cadastro Core de `users`; não cria outra
identidade para a pessoa, outro perfil ou outro mecanismo de sessão.

### 1. Shared: contrato e catálogo

O contrato da aplicação é publicado no Shared sem decorators, entidades ou dependências da API:

```text
apps/shared/src/
├── contracts/logistics/users/logistics-user.contract.ts
├── contracts/logistics/users/index.ts
└── catalog/logistics.functionality.ts
```

```ts
export interface SaveLogisticsUserRequest {
  operationalCode: string;
  user: SaveUserRequest;
}

export interface GetLogisticsUserResponse {
  operationalCode: string;
  user: GetUserByIdResponse;
}
```

Como este caso apenas especializa a funcionalidade Core `users`, ele reutiliza o slug `users`, suas
ações e o modelo de acesso existente. Portanto, não adiciona uma funcionalidade duplicada no seed.
Se `logistics` precisar de uma tela autônoma, como `delivery-routes`, a derivação cria sua entrada no
catálogo, soma seu literal a `FunctionalitySlug` e inclui módulo, traduções, ícone e ações no seed ou
modelo de acesso da aplicação.

### 2. API: persistência proprietária e módulo da aplicação

O complemento pertence à aplicação e tem seu próprio módulo. Ele pode relacionar `User` e `Client`
para declarar integridade referencial, mas não ganha o direito de persistir essas entidades.

```text
apps/api/src/modules/logistics/
├── logistics.module.ts
└── users/
    ├── dto/req/save-logistics-user-request.dto.ts
    ├── dto/res/get-logistics-user-response.dto.ts
    ├── entities/user-complement.entity.ts
    ├── logistics-users.controller.ts
    ├── logistics-users.module.ts
    ├── logistics-users.service.ts
    └── user-complement.repository.ts
```

O DTO da aplicação implementa `SaveLogisticsUserRequest`, aplica seus próprios decorators de
validação e adapta a entrada HTTP antes de chegar ao service. O controller obtém o `clientId` pelo
contexto autenticado confiável, exige a mesma permissão de `users` e delega tudo ao
`LogisticsUsersService`.

```ts
async save(
  clientId: number,
  request: SaveLogisticsUserRequest,
): Promise<GetLogisticsUserResponse> {
  const result = await this.dataSource.transaction(async (manager) => {
    const user = await this.usersService.saveInTransaction(clientId, request.user, manager);
    const existingComplement = await this.userComplementRepository.findByClientAndUser(
      clientId,
      user.id,
      manager,
    );
    const complement = await this.userComplementRepository.save(
      {
        ...(existingComplement === null ? {} : { id: existingComplement.id }),
        client: { id: clientId },
        operationalCode: request.operationalCode,
        user: { id: user.id },
      },
      manager,
    );

    return { complement, user };
  });

  await this.usersService.synchronizeMutation();

  return {
    operationalCode: result.complement.operationalCode,
    user: await this.usersService.getById(clientId, result.user.id),
  };
}
```

O repository derivado só salva `UserComplement` por meio do `EntityManager` recebido. O
`UsersService` continua responsável por validar perfil, vínculo com o cliente, senha, estado e
imagem; nenhuma dessas regras é copiada pela aplicação. O `LogisticsUsersModule` importa
`UsersModule`, e o `LogisticsModule` é importado pelo `AppModule` da aplicação derivada somente
quando essa capacidade existir.

Após a operação relacional terminar, a sincronização de sessão ocorre fora da transação. Se a
gravação do complemento falhar, o usuário e seu vínculo também sofrem rollback e nenhuma sessão é
sincronizada.

### 3. Banco, migration e materialização de permissões

A aplicação cria uma migration append-only para a tabela de complementos e suas restrições, por
exemplo uma unicidade de `cliente_id` e `usuario_id`. Se o caso reutiliza `users`, não deve criar
módulo, funcionalidade, perfil ou permissão persistidos duplicados.

Quando uma nova funcionalidade logística for necessária, a migration/seed versionada da aplicação
declara seus dados completos: módulo, funcionalidade, traduções, ícone, ordem e ações. Depois, ela
é concedida por um modelo de acesso ou pelo fluxo autorizado de configuração do cliente. O catálogo
estático sozinho não produz esses registros.

### 4. Web: feature, binding e integração HTTP

```text
apps/web/src/
├── features/logistics/admin/users/
│   ├── components/LogisticsUserForm.tsx
│   ├── hooks/useLogisticsUserForm.ts
│   └── pages/LogisticsUserSaveView.tsx
├── registry/admin/logistics.registry.ts
└── routes/logistics-api-routes.ts
```

`LogisticsUserForm` compõe os campos de usuário e o campo `operationalCode`, mantendo o estado de
formulário em um único payload `SaveLogisticsUserRequest`. A view usa a infraestrutura comum de
requisições e a rota da aplicação para salvar esse payload; ela não chama diretamente services da
API nem usa IDs de cliente vindos do navegador como autorização.

O registry deriva explicitamente o binding do slug `users` para a view logística nos modos em que a
especialização é necessária. Assim, a rota protegida continua usando a identidade e a apresentação
de permissões do Core, enquanto a interface é substituída conscientemente. Se a funcionalidade for
nova, o binding usa o novo slug derivado e só fica disponível depois de materializado para o cliente.

### 5. Fluxo completo

```text
Web form
  -> Shared SaveLogisticsUserRequest
  -> POST da aplicação derivada
  -> controller: autenticação, contexto confiável e permissão
  -> LogisticsUsersService
      -> uma transação
          -> UsersService.saveInTransaction(...)
          -> UserComplementRepository.save(...)
      -> UsersService.synchronizeMutation() após commit
  -> Shared GetLogisticsUserResponse
  -> atualização da feature Web
```

O teste unitário da aplicação cobre a coordenação e o rollback. O teste de integração verifica a
relação persistida e suas restrições. O E2E autentica um usuário com a permissão adequada, salva o
cadastro estendido, lê o resultado e confirma que outro cliente não pode acessar o complemento.

## Checklist de uma derivação

- O recurso pertence à aplicação ou é uma melhoria geral reutilizável do Core?
- A aplicação consome services públicos, sem importar repository estrangeiro?
- Uma operação multiagregado compartilha uma única transação e executa efeitos externos após o
  commit?
- O contrato HTTP foi criado no Shared sem dependências de framework?
- O slug está no catálogo composto, no seed/modelo de acesso e no binding Web?
- As permissões continuam decididas pela API, com contexto confiável?
- As migrations próprias são append-only e os dados de seed permanecem versionados?
- A documentação de API, Shared e Web foi atualizada se uma nova fronteira foi criada?

Consulte também [Módulos da API](../desenvolvimento/modulos-api.md),
[Shared](../desenvolvimento/shared.md) e [Features Web administrativas](../desenvolvimento/features-web-administrativas.md).
