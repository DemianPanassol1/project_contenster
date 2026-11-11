# Documentação

Esta documentação registra limites, decisões confirmadas e práticas da aplicação. Código, contratos,
migrations e testes são a evidência executável; documentos explicam responsabilidades e não
antecipam soluções sem implementação ou decisão confirmada.

> Estado documental: documentos marcados como **Pendente** reservam o assunto e ainda não descrevem uma solução operacional ou arquitetural.

## Contexto e decisões

- [Contexto e escopo](./contexto-e-escopo.md): propósito do Core, capacidades e exclusões.
- [Decisões em aberto](./decisoes-em-aberto.md): questões que não podem virar convenção por inferência.

## Arquitetura

- [Visão geral](./arquitetura/visao-geral.md): aplicações, fronteiras e dependências.
- [Identidade, RBAC e contexto](./arquitetura/identidade-rbac-e-contexto.md): sessão, acesso e isolamento por cliente.
- [Catálogo de funcionalidades](./arquitetura/catalogo-de-funcionalidades.md): identidades técnicas, materialização e relação com permissões.
- [Persistência](./arquitetura/persistencia.md): modelo de dados, ownership, migrations, bootstrap e
  operação local de PostgreSQL e Redis.
- [Contratos e integração](./arquitetura/contratos-e-integracao.md): fronteiras entre Shared, API e Web.
- [Extensibilidade](./arquitetura/extensibilidade.md): **Pendente**.

## Desenvolvimento

- [Convenções](./desenvolvimento/convencoes.md): regras gerais de legibilidade e manutenção.
- [Módulos da API](./desenvolvimento/modulos-api.md): padrões NestJS observados.
- [Features Web administrativas](./desenvolvimento/features-web-administrativas.md): features protegidas, registry, formulários e listagens.
- [Shared](./desenvolvimento/shared.md): contratos, domínio e catálogo sem framework.
- [Nulidade e inicialização](./desenvolvimento/nulidade-e-inicializacao.md): `null`, `undefined` e `declare` na API.
- [Testes](./desenvolvimento/testes.md): camadas existentes e seus limites.
- [Validação](./desenvolvimento/validacao.md): comandos e evidências.

## Infraestrutura

- [Ambientes](./infraestrutura/ambientes.md): variáveis e dependências locais.
- [Docker](./infraestrutura/docker.md): **Pendente**.
- [Observabilidade](./infraestrutura/observabilidade.md): logs e diagnóstico existentes.
- [Segurança operacional](./infraestrutura/seguranca-operacional.md): segredos e credenciais.

## Entrega

- [CI/CD](./entrega/ci-cd.md): **Pendente**.
- [Deploy](./entrega/deploy.md): **Pendente**.
- [Rollback](./entrega/rollback.md): **Pendente**.
- [Versionamento](./entrega/versionamento.md): **Pendente**.

## Espaços reservados

- [Guias](./guias/README.md): procedimentos recorrentes serão incluídos quando houver conteúdo consolidado.
- [Decisões arquiteturais](./decisoes/README.md): ADRs futuros, sem reconstrução retrospectiva.
