# Persistência operacional

PostgreSQL armazena dados autoritativos da aplicação. Redis armazena sessões opacas e recursos
técnicos que não substituem a fonte autoritativa no banco.

Para desenvolvimento, configure host, porta, credenciais, banco, TLS e timeouts pelos grupos
`DATABASE_*` e `REDIS_*` no ambiente da API. Testes de integração e e2e usam configuração isolada
em `apps/api/.env.test`, com banco e database Redis específicos.

Migrations são executadas pelos scripts da API:

```bash
pnpm --filter api migration:show
pnpm --filter api migration:run
pnpm --filter api migration:revert
```

Esses comandos alteram banco de dados e exigem ambiente e autorização adequados. Para regras de
modelagem, ownership e evolução de schema, consulte
[Persistência arquitetural](../arquitetura/persistencia.md).
