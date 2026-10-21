# Testes

| Tipo       | Objetivo                                           | Dependências                                           |
| ---------- | -------------------------------------------------- | ------------------------------------------------------ |
| Unitário   | Regra isolada e determinística                     | Mocks de fronteira quando necessários                  |
| Integração | Repositório, persistência ou integração delimitada | PostgreSQL e demais dependências do fluxo              |
| E2E        | Fluxo HTTP completo                                | App Nest real, guards, validação e banco real de teste |
| Smoke      | Verificação e2e mínima                             | Inicialização e caminhos críticos mínimos              |

O smoke atual verifica a inicialização da API e `GET /health`. Ele não substitui os e2e de sessão, troca de contexto, RBAC e isolamento por cliente.

## Estrutura

- Specs de unidade ficam próximas ao módulo quando isso melhora a leitura.
- Integração fica em `apps/api/test/integration`.
- E2E e smoke ficam em `apps/api/test/e2e`.
- Fábricas, fixtures e infraestrutura compartilhada ficam em `apps/api/test/runner`.

O bootstrap de teste deve usar a mesma configuração de aplicação empregada no runtime. E2E não deve substituir banco, repositórios, guards ou sessão por mocks.

## Ambiente descartável de integração e e2e

As suítes `test:integration` e `test:e2e` usam exclusivamente `apps/api/.env.test`. Antes de cada
execução, o runner exige `NODE_ENV=test`, `DATABASE_NAME=contenster_slim_core_test` e
`REDIS_DATABASE=1`. Essas verificações impedem que um reset atinja o ambiente de desenvolvimento.

O ciclo é deliberadamente destrutivo apenas para esses recursos de teste:

1. remove e recria o schema PostgreSQL `public`;
2. executa todas as migrations, incluindo o bootstrap;
3. limpa somente o database Redis configurado com `FLUSHDB`;
4. executa as specs serialmente;
5. ao término, fecha conexões, limpa o Redis e recria o schema vazio.

Não use `FLUSHALL`, banco de desenvolvimento, serviços externos de SMTP/GCP/R2 ou uma porta HTTP
real para e2e. Os fluxos HTTP usam a aplicação Nest inicializada pelo Supertest.

## Invariantes prioritários

- credenciais válidas e inválidas;
- expiração, revogação e rotação da sessão;
- troca de contexto permitida e negada;
- usuário, cliente ou perfil inativo após a sessão;
- permissão presente e ausente;
- recurso de um cliente inacessível a contexto de outro cliente.

## Cobertura implementada

Os testes devem crescer por comportamento e risco, não pela existência de um arquivo por classe ou
camada. Controllers são exercitados preferencialmente por e2e; repositories, relações TypeORM e
constraints pertencem à integração; regras isoladas pertencem às specs unitárias.

| Tipo       | Cobertura atual                                                                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitário   | Guard de permissões, tokens e sincronização de sessão, resolução de locale e traduções, criptografia de credenciais, sanitização SVG e rotinas de limpeza.                                                             |
| Integração | Bootstrap das migrations, constraints nomeadas, sessão opaca no Redis, remoção de permissões órfãs e impedimento de vínculo `UserProfile` com perfil de outro cliente.                                                 |
| E2E        | Autenticação, cookie opaco, troca e sincronização de sessão, RBAC, cadastros de idiomas, ações, módulos, funcionalidades, perfis, usuários, cliente, locations, storage e consultas de logs de requisição e de rotina. |
| Smoke      | Inicialização da aplicação e healthcheck.                                                                                                                                                                              |

Essa matriz não substitui casos futuros para regras novas. Toda alteração que mudar autorização,
isolamento por cliente, persistência em cascata, sessão ou interface HTTP deve estender a camada de
teste correspondente.
