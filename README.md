# Contenster Slim Core

Monorepo para uma aplicação administrativa multi-cliente, focada em identidade, autenticação,
autorização baseada em perfis e catálogo técnico de funcionalidades.

O sistema mantém o isolamento entre clientes por contexto autenticado. Um usuário pode estar
vinculado a clientes diferentes, mas possui um único perfil ativo em cada cliente.

## Escopo

O Core contempla clientes, usuários, perfis, permissões, funcionalidades, módulos, idiomas,
localização, arquivos, observabilidade e rotinas técnicas. Não contempla produtos, portais,
administração global, perfis virtuais, sessões virtuais ou troca administrativa de contexto.

## Pré-requisitos

- Node.js `24.20.0`
- pnpm `11.24.0`
- PostgreSQL e Redis para os fluxos que dependem de persistência e sessão

## Primeiros passos

```bash
pnpm install
pnpm dev
```

Os serviços também podem ser executados individualmente:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

## Swagger

Com o ambiente local configurado em `apps/api/.env`, a documentação da API fica disponível em
`http://localhost:7070/api/v1/docs`. A rota completa também está explícita em `SWAGGER_PATH` e é
informada no log de inicialização da API quando o Swagger estiver habilitado.

## Validação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter api test:smoke
```

## Estrutura

```text
apps/api     API NestJS, segurança, regras de negócio e persistência
apps/shared  contratos e catálogo técnico compartilhados
apps/web     aplicação Next.js e interação no navegador
docs         arquitetura, convenções e decisões do projeto
```

O usuário inicial do bootstrap usa as credenciais genéricas `admin` / `123456`. Elas devem ser
alteradas antes de qualquer uso externo da aplicação.

Para orientações de desenvolvimento e o mapa completo da documentação, consulte [AGENTS.md](./AGENTS.md).
