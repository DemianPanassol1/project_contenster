# Documentação

Esta pasta registra decisões, limites e práticas do Contenster Slim Core para desenvolvimento, revisão e manutenção.

Código, migrations, contratos e testes são a evidência executável. A documentação explica intenção e limites; divergências devem ser corrigidas junto da implementação.

## Arquitetura

- [Visão geral](./arquitetura/visao-geral.md): responsabilidades e dependências do monorepo.
- [Identidade, RBAC e contexto](./arquitetura/identidade-rbac-e-contexto.md): autenticação, sessão, seleção de cliente, perfil e isolamento.
- [Catálogo de funcionalidades](./arquitetura/catalogo-de-funcionalidades.md): identidades técnicas e separação entre autorização e interface.
- [Persistência](./arquitetura/persistencia.md): banco, ownership, migrations, seeds e exclusão lógica.

## Desenvolvimento

- [Convenções](./desenvolvimento/convencoes.md): organização e responsabilidades de código.
- [Features Web administrativas](./desenvolvimento/features-web-administrativas.md): padrão de
  estrutura, rotas, listagens e formulários do painel protegido.
- [Nulidade e inicialização](./desenvolvimento/nulidade-e-inicializacao.md): uso de `null`, `undefined` e `declare` na API.
- [Testes](./desenvolvimento/testes.md): unitários, integração, e2e e smoke.
- [Validação](./desenvolvimento/validacao.md): comandos e significado das evidências.

## Contexto e decisões

- [Contexto e escopo](./contexto-e-escopo.md): capacidades previstas e exclusões intencionais.
- [Decisões em aberto](./decisoes-em-aberto.md): itens que exigem decisão explícita antes de virarem convenção.
