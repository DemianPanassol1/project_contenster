# Contenster Slim Core

O Contenster Slim Core é um monorepo TypeScript para uma aplicação administrativa multi-cliente. Ele reúne capacidades reutilizáveis de identidade, autenticação, sessão, autorização baseada em perfis, isolamento por cliente e administração técnica.

O projeto é uma base independente: aplicações futuras partem de uma cópia deste repositório e evoluem com código, infraestrutura e ciclo de vida próprios. Não há sincronização automática entre o Core e os repositórios derivados.

## Capacidades principais

- autenticação, recuperação de senha e sessões opacas;
- usuários, clientes, vínculos, perfis e permissões;
- contexto autenticado e isolamento de dados por cliente;
- módulos e catálogo técnico de funcionalidades;
- localização, arquivos, armazenamento, logs e tarefas técnicas;
- superfícies administrativas, incluindo as capacidades globais existentes no checkout.

## Stack

- Node.js `24.22.1` e pnpm `11.24.0`;
- NestJS na API, Next.js no Web e TypeScript compartilhado;
- PostgreSQL para dados autoritativos e Redis para sessão e recursos técnicos.

## Primeiros passos

Copie e ajuste os arquivos de ambiente de cada aplicação sem versionar segredos. Em seguida:

```bash
pnpm install
pnpm dev
```

Os serviços também podem ser iniciados separadamente:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

O exemplo de ambiente da API define a porta `8080`; a porta efetiva pode ser alterada por `apps/api/.env`. Com Swagger habilitado, a rota é definida por `SWAGGER_PATH` e é registrada na inicialização da API.

O bootstrap cria credenciais iniciais genéricas (`admin` / `123456`). Elas servem somente para a instalação inicial e devem ser trocadas antes de qualquer exposição externa.

## Validação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter api test:smoke
pnpm build
git diff --check
```

Esses comandos comprovam aspectos diferentes; build e testes não substituem validação de ambiente, browser, CI ou produção.

## Documentação

Consulte o [índice técnico](./docs/README.md) para arquitetura, desenvolvimento, infraestrutura e entrega. O [AGENTS.md](./AGENTS.md) é um guia de trabalho e roteador de contexto para agentes e desenvolvedores, sem substituir a documentação especializada.
