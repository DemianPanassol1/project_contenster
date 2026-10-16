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

## Invariantes prioritários

- credenciais válidas e inválidas;
- expiração, revogação e rotação da sessão;
- troca de contexto permitida e negada;
- usuário, cliente ou perfil inativo após a sessão;
- permissão presente e ausente;
- recurso de um cliente inacessível a contexto de outro cliente.
