# Persistência operacional

PostgreSQL armazena dados autoritativos da aplicação. Redis armazena sessões opacas e recursos
técnicos que não substituem a fonte autoritativa no banco.

Para desenvolvimento, configure host, porta, credenciais, banco, TLS e timeouts pelos grupos
`DATABASE_*` e `REDIS_*` no ambiente da API. Testes de integração e e2e usam configuração isolada
em `apps/api/.env.test`, com banco e database Redis específicos.

As migrations ficam diretamente em `apps/api/src/database/migrations`. Arquivos estruturais alteram o
schema; arquivos de bootstrap usam o prefixo `core-seed-` e inserem os dados de referência e a identidade
superusuária necessários para uma instalação vazia. Seeds resolvem relações por identificadores de domínio e pelos
valores retornados pelo banco, nunca por IDs numéricos pressupostos.

Os scripts da API compilam a aplicação antes de operar e apresentam o estado das migrations configuradas,
executadas, pendentes e eventualmente presentes apenas no banco:

```bash
pnpm --filter api migration:generate --name <nome-da-migration>
pnpm --filter api migration:show
pnpm --filter api migration:run
pnpm --filter api migration:revert
```

`migration:run` também lista as migrations aplicadas na execução. `migration:revert` informa qual é a
última migration executada que será desfeita. A geração compara as entidades com o banco configurado e
deve ser revisada antes de ser versionada.

Esses comandos alteram banco de dados e exigem ambiente e autorização adequados. Para regras de
modelagem, ownership e evolução de schema, consulte
[Persistência arquitetural](../arquitetura/persistencia.md).
