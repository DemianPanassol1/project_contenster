# Persistência

## Banco e ownership

O sistema usa PostgreSQL em um único schema. O contexto de cliente limita autorização e dados; ele nunca escolhe schema, conexão ou datasource.

Entidades pertencentes a cliente devem possuir ownership explícito. Serviços e repositórios aplicam o `clientId` do contexto autenticado em leituras, alterações e exclusões.

As foreign keys recebem nomes semânticos explícitos tanto na migration quanto no `@JoinColumn` da
entidade. Isso permite traduzir violações de integridade sem acoplamento a nomes gerados pelo ORM.

## TypeORM e migrations

- `synchronize` permanece desativado.
- Entidades são explícitas.
- Migrations estruturais e de seed são append-only após serem aplicadas.
- Toda migration possui `up` e `down` coerentes.
- Fixtures de testes não pertencem às migrations de bootstrap.
- Seeds de bootstrap usam chaves naturais e valores retornados pelos `INSERT`s para encadear relações;
  não pressupõem IDs numéricos preexistentes.

Uma alteração que preserve invariantes entre vários registros deve usar uma transação única e compartilhar o mesmo `EntityManager` entre os participantes.

## Seeds e exclusão lógica

O bootstrap técnico materializa referências necessárias para operar: idiomas e ações globais,
localização, a identidade superusuária inicial e um modelo de acesso administrativo global. O modelo
declara módulos e funcionalidades, mas não os materializa para nenhum cliente: essa materialização
ocorre somente quando o modelo é aplicado a um cliente pelo fluxo autorizado.

Cada migration de seed possui um snapshot JSON versionado em `apps/api/src/database/seeds`, com o
mesmo prefixo numérico da migration consumidora. A migration mantém a lógica de persistência,
validação e reversão; o JSON contém exclusivamente dados declarativos. Ambos são históricos e
imutáveis após a aplicação: uma mudança de catálogo exige um novo par de migration e snapshot, sem
alterar o conteúdo de um seed já aplicado.

Somente `User` e `Client` usam exclusão lógica. Para as demais entidades, não introduza `deletedAt` ou comportamento equivalente sem requisito explícito.

Configurações de armazenamento podem ser removidas somente quando o PostgreSQL permitir: regras de
tipo de arquivo ainda vinculadas são protegidas por `RESTRICT`, e a violação da FK é convertida pela
API em uma mensagem de domínio. Não replique essa integridade com consultas prévias apenas para
antecipar o erro do banco.

## Ambiente e comandos operacionais

PostgreSQL armazena dados autoritativos da aplicação. Redis armazena sessões opacas e recursos
técnicos que não substituem a fonte autoritativa no banco.

Para desenvolvimento, configure host, porta, credenciais, banco, TLS e timeouts pelos grupos
`DATABASE_*` e `REDIS_*` no ambiente da API. Testes de integração e e2e usam configuração isolada
em `apps/api/.env.test`, com banco e database Redis específicos.

Os scripts da API compilam a aplicação antes de operar e apresentam o estado das migrations
configuradas, executadas, pendentes e eventualmente presentes apenas no banco:

```bash
pnpm --filter api migration:generate --name <nome-da-migration>
pnpm --filter api migration:show
pnpm --filter api migration:run
pnpm --filter api migration:revert
```

`migration:run` também lista as migrations aplicadas na execução. `migration:revert` informa qual é a
última migration executada que será desfeita. A geração compara as entidades com o banco configurado e
deve ser revisada antes de ser versionada.

Esses comandos alteram banco de dados e exigem ambiente e autorização adequados.
