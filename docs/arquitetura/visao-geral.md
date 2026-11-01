# Visão geral da arquitetura

```text
apps/api  --->  apps/shared  <---  apps/web
                    |
          contratos e catálogo técnico
```

## Shared

`apps/shared` contém contratos públicos, tipos de domínio, utilitários independentes de framework e o catálogo técnico de funcionalidades. Não pode depender de NestJS, Next.js, React, TypeORM ou de implementações da API e do Web.

## API

`apps/api` é a autoridade para autenticação, sessão, autorização, contexto de cliente, ownership, validação HTTP, regras de negócio, transações, persistência, migrations, seeds, logs e tarefas.

## Web

`apps/web` é responsável por apresentação e interação no navegador. Ele mantém o token opaco em cookie HTTP-only e não deve expor, persistir ou confiar em credenciais no código de cliente.

Checagens de permissão no Web controlam apresentação, mas não autorizam requests. A API deve repetir a decisão por guards, contexto autenticado e regras do caso de uso.

## Regras de dependência

- API e Web podem importar contratos públicos do Shared.
- Shared não importa das aplicações.
- Web não importa serviços, entidades ou repositórios da API.
- API não importa componentes, rotas ou dependências de interface do Web.

O ESLint deve preservar essas fronteiras.

## Organização por responsabilidades

Na API, as capacidades da base ficam em `modules/core`, agrupadas em domínios como `identity`,
`access-control`, `authorization`, `locations`, `media`, `observability`, `scheduling`,
`system-admin` e `public-portal`. `CoreModule` as compõe para a aplicação. Um domínio de uma
aplicação derivada fica como irmão de `core`, sem misturar sua implementação com a base. Essa
divisão orienta a composição dos módulos; ela não autoriza dependências arbitrárias entre recursos.

`system-admin` é um agregador de capacidades globais: `access-links`, `clients`, `files`,
`job-logs`, `request-logs` e `portals`. Cada capacidade é um submódulo com suas dependências e
fronteiras de HTTP, negócio e persistência próprias. O controller raiz do agregador fica reservado
para evolução futura; os controllers internos preservam os paths públicos sob `system-admin` e
declaram a autorização de superusuário explicitamente.

No Web, as superfícies do Core estão em `features/core/admin`, `features/core/auth`,
`features/core/public` e `features/core/system-admin`. Recursos reutilizáveis entre domínios ficam
fora dessa árvore, em `features/shared`; uma aplicação derivada deve adicionar suas features como
irmãs de `core`. Uma tela administrativa não transfere para o navegador a decisão de acesso ou o
isolamento dos dados.
