# Guia do projeto

## Propósito e estrutura

A aplicação é administrativa e multi-cliente, concentrando identidade, autenticação, sessões, RBAC,
contexto de cliente e capacidades técnicas compartilhadas. Este repositório é usado como template
independente: aplicações derivadas não mantêm sincronização automática com sua origem.

```text
apps/api     NestJS: HTTP, regras de negócio, segurança e persistência
apps/shared  TypeScript independente de framework: contratos, domínio e catálogo
apps/web     Next.js: apresentação, sessão no navegador e interação
docs         documentação técnica e operacional
```

```text
apps/api  --->  apps/shared  <---  apps/web
```

O Shared não importa NestJS, Next.js, React, TypeORM ou código das aplicações. A API é a fonte de verdade para autenticação, autorização, contexto, regras de negócio e persistência. Permissões no Web controlam apresentação; nunca autorizam requests.

## Stack

- Node.js `24.22.1`, pnpm `11.24.0` e TypeScript `6.0.2`;
- NestJS `12.1.3`, Next.js `16.4.1` e React `19.3.1`;
- PostgreSQL e Redis.

Consulte os `package.json` para versões e scripts completos.

## Invariantes essenciais

- Usuário pode ter vínculos com vários clientes, com no máximo um perfil por cliente.
- O contexto autenticado reúne usuário, cliente e perfil; sua troca é autenticada e valida o vínculo persistido.
- A sessão usa token opaco em cookie HTTP-only e estado no Redis; PostgreSQL é autoritativo para identidade, perfil e permissões.
- Dados de cliente sempre são limitados pelo contexto confiável. Identificadores do navegador não comprovam acesso.
- O banco usa um schema e TypeORM opera com `synchronize: false`; migrations aplicadas são append-only.
- Somente usuário e cliente possuem exclusão lógica. O catálogo técnico em `apps/shared/src/catalog` não é banco, rota Web nem concessão de permissão.

Os detalhes e limites normativos estão nos documentos indicados abaixo; não replique suas regras em novas instruções locais sem necessidade.

## Como trabalhar

1. Localize a documentação aplicável e uma capacidade equivalente antes de mudar código.
2. Mantenha a mudança no proprietário correto: Shared, API ou Web.
3. Preserve contratos, identificadores persistidos, migrations e compatibilidade, salvo decisão explícita em sentido contrário.
4. Não introduza abstrações, dependências ou fluxos sem necessidade comprovada.
5. Diferencie evidência executada de inferência documental ou proposta futura.

## Validação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter api test:smoke
pnpm build
git diff --check
```

Execute o conjunto proporcional à mudança e informe apenas o que foi efetivamente validado. Lint, tipagem, testes, build, browser, CI e produção são evidências distintas.

## Roteiro de consulta

| Tarefa                           | Documento principal                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Escopo do Core ou derivação      | [Contexto e escopo](./docs/contexto-e-escopo.md)                                              |
| Limites entre aplicações         | [Visão geral](./docs/arquitetura/visao-geral.md)                                              |
| Autenticação, RBAC ou isolamento | [Identidade, RBAC e contexto](./docs/arquitetura/identidade-rbac-e-contexto.md)               |
| Catálogo e permissões            | [Catálogo de funcionalidades](./docs/arquitetura/catalogo-de-funcionalidades.md)              |
| Dados, migrations ou bootstrap   | [Persistência arquitetural](./docs/arquitetura/persistencia.md)                               |
| Contratos API, Shared e Web      | [Contratos e integração](./docs/arquitetura/contratos-e-integracao.md)                        |
| Novo módulo NestJS               | [Módulos da API](./docs/desenvolvimento/modulos-api.md)                                       |
| Feature administrativa Web       | [Features Web administrativas](./docs/desenvolvimento/features-web-administrativas.md)        |
| Mudança no Shared                | [Shared](./docs/desenvolvimento/shared.md)                                                    |
| Testes e comandos de qualidade   | [Testes](./docs/desenvolvimento/testes.md) e [validação](./docs/desenvolvimento/validacao.md) |
| Ambiente, Docker e operação      | [Infraestrutura](./docs/README.md#infraestrutura)                                             |
| CI, deploy ou rollback           | [Entrega](./docs/README.md#entrega)                                                           |

Consulte o [índice da documentação](./docs/README.md) para o mapa completo e para assuntos pendentes de decisão.
