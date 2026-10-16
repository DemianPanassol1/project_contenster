# Guia do projeto

## Propósito

O Contenster Slim Core é uma aplicação administrativa multi-cliente. Seu núcleo é formado por
clientes, usuários, perfis, permissões, autenticação com sessão opaca e catálogo técnico de
funcionalidades.

O projeto não possui produtos, portais, administração global, perfis virtuais, sessão virtual,
seleção de schema por request ou controle manual de timezone.

## Estrutura do monorepo

```text
apps/api     NestJS: HTTP, autenticação, autorização, persistência e tarefas técnicas
apps/shared  TypeScript sem dependências de framework: contratos, domínio e catálogo
apps/web     Next.js: apresentação, sessão no navegador e interação do usuário
docs         documentação de arquitetura e desenvolvimento
```

A direção de dependências é obrigatória:

```text
apps/api  --->  apps/shared  <---  apps/web
```

O Shared não importa NestJS, Next.js, React, TypeORM ou código das aplicações. A API é a fonte de
verdade para autenticação, autorização, contexto, regras de negócio e persistência. Checagens de
permissão no Web servem à apresentação e não substituem a segurança da API.

## Stack e versões fixadas

- Node.js `24.20.0`
- pnpm `11.24.0`
- TypeScript `6.0.3`
- NestJS `12.1.3`
- Next.js `16.4.1`
- React `19.3.1`
- PostgreSQL e Redis

Consulte os `package.json` para a lista completa e as versões exatas das dependências.

## Regras arquiteturais confirmadas

- Um usuário pode ter vínculos com clientes diferentes e possui no máximo um perfil por cliente.
- O contexto autenticado reúne usuário, cliente e perfil. A troca de contexto passa por rota
  autenticada e valida o vínculo persistido.
- A sessão usa token opaco no cookie HTTP-only e estado no Redis. PostgreSQL permanece a fonte
  autoritativa para usuário, cliente, perfil e permissões.
- Toda operação pertencente a cliente usa o contexto autenticado confiável para limitar leitura e
  escrita. Identificadores enviados pelo navegador nunca comprovam acesso.
- O banco usa um único schema. TypeORM opera com `synchronize: false` e migrations append-only.
- Soft delete existe somente para usuário e cliente. Demais exclusões exigem regra explícita.
- O catálogo técnico de funcionalidades pertence a `apps/shared/src/catalog`. Ele não é banco,
  roteamento Web nem concessão de permissão.
- O bootstrap materializa idiomas, ações, localização, módulos, funcionalidades, cliente, perfil,
  vínculo inicial e usuário inicial genérico. A senha padrão deve ser alterada antes de uso externo.

## Como trabalhar

1. Leia a documentação aplicável antes de alterar uma fronteira arquitetural.
2. Localize a capacidade equivalente já existente antes de criar estruturas novas.
3. Classifique a mudança como preservação, adaptação ou remoção antes de implementá-la.
4. Mantenha a alteração no proprietário correto: Shared, API ou Web.
5. Não introduza abstrações, dependências, entidades ou fluxos sem necessidade comprovada.
6. Preserve contratos, identificadores persistidos, migrations aplicadas e compatibilidade quando
   não houver decisão explícita de mudança.

## Validação mínima

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter api test:smoke
pnpm build
git diff --check
```

Lint, tipagem, testes, build, browser, CI e produção são evidências diferentes. Informe somente
o que foi efetivamente executado.

## Dicionário da documentação

| Documento                                                                                              | Consulte quando precisar entender                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [docs/README.md](./docs/README.md)                                                                     | O mapa completo da documentação                          |
| [docs/contexto-e-escopo.md](./docs/contexto-e-escopo.md)                                               | O que pertence ou não ao Core                            |
| [docs/arquitetura/visao-geral.md](./docs/arquitetura/visao-geral.md)                                   | Limites entre API, Shared e Web                          |
| [docs/arquitetura/identidade-rbac-e-contexto.md](./docs/arquitetura/identidade-rbac-e-contexto.md)     | Login, sessão, contexto, perfis e isolamento por cliente |
| [docs/arquitetura/catalogo-de-funcionalidades.md](./docs/arquitetura/catalogo-de-funcionalidades.md)   | Identidade, materialização e uso das funcionalidades     |
| [docs/arquitetura/persistencia.md](./docs/arquitetura/persistencia.md)                                 | Banco, ownership, migrations, seeds e exclusão lógica    |
| [docs/desenvolvimento/convencoes.md](./docs/desenvolvimento/convencoes.md)                             | Organização de módulos e responsabilidades de código     |
| [docs/desenvolvimento/nulidade-e-inicializacao.md](./docs/desenvolvimento/nulidade-e-inicializacao.md) | Uso de `null`, `undefined` e `declare` na API            |
| [docs/desenvolvimento/testes.md](./docs/desenvolvimento/testes.md)                                     | Unitários, integração, e2e e smoke                       |
| [docs/desenvolvimento/validacao.md](./docs/desenvolvimento/validacao.md)                               | Evidências de validação esperadas                        |
| [docs/decisoes-em-aberto.md](./docs/decisoes-em-aberto.md)                                             | Questões que não devem virar regra implícita             |
