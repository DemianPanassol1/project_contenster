# Módulos da API

Este diretório separa as capacidades do core da aplicação das extensões de uma aplicação derivada.
Ele é um guia local de organização; as regras arquiteturais, de persistência, contratos e
autorização continuam definidas em [`docs/`](../../../../docs/README.md).

```text
modules/
├── core/
│   ├── core.module.ts
│   └── <domínio-do-core>/
└── <domínio-da-aplicação>/
    └── <domínio-da-aplicação>.module.ts
```

## Core

`core/` reúne exclusivamente as capacidades administrativas e operacionais que pertencem à base
reutilizável. `CoreModule` é a composição dessas capacidades para o `AppModule`; ele não substitui
a infraestrutura configurada no nível da aplicação, como banco, Redis, i18n, rate limit, arquivos
estáticos, scheduler e health check.

Não inclua um recurso específico de uma aplicação derivada no Core apenas por ele depender de
identidade, autorização ou outro recurso da base.

### Agregação por capacidades administrativas

`core/system-admin` é um módulo agregador para capacidades administrativas globais. Ele mantém o
controller raiz vazio e protegido, e compõe `access-links`, `clients`, `files`, `job-logs`,
`request-logs`, `portals`, `actions`, `languages` e `locations`. `locations` agrega `countries`,
`states` e `cities`. Cada capacidade registra suas próprias dependências, controller, service,
repository e DTOs; o agregador não concentra regras, persistência ou contratos específicos.

Os controllers das capacidades preservam o prefixo HTTP `system-admin` e declaram
`@RequireSuperuser()` individualmente. Assim, a organização interna não altera os contratos
públicos nem enfraquece a autorização.

## Domínios da aplicação

Uma capacidade especializada deve ficar em um diretório irmão de `core/`, agrupada pelo domínio
que ela representa. Seu módulo de composição é importado explicitamente pelo `AppModule`, sem
alterar o conteúdo de `CoreModule`.

Antes de criar o módulo, confirme o proprietário de cada contrato, a identidade no catálogo Shared,
as migrations necessárias e os limites de autorização. Siga os documentos de desenvolvimento e
arquitetura para a estrutura interna de controllers, services, repositories, DTOs e entidades.
