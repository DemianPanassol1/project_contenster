# Contratos e integração

## Responsabilidades

O `apps/shared` publica contratos, tipos de domínio, utilitários sem framework e o catálogo técnico.
A API implementa a fronteira HTTP, valida entradas, aplica regras e converte suas respostas para
esses contratos. O Web consome os contratos e as rotas da API para apresentar a interface.

```text
Shared: identidade de dados e tipos públicos
API:    implementação HTTP, segurança e persistência
Web:    consumo, apresentação e interação
```

Um contrato compartilhado não transporta dependências de NestJS, TypeORM, React ou Next.js. DTOs de
request e response da API implementam o contrato correspondente quando ele existe; entidades,
repositories e componentes de interface não fazem parte do contrato público.

## Evolução coordenada

Mudanças de contrato exigem revisar os dois consumidores: API e Web. O Core não mantém uma camada
automática de compatibilidade para formatos antigos de sessão ou resposta HTTP. Não introduza
heurísticas no Web para inferir campos ausentes, reescrever payloads ou repetir requests como forma
de compatibilidade.

Rotas usadas pelo Web são centralizadas em `apps/web/src/routes`. A URL base, credenciais de sessão,
idioma e normalização de respostas pertencem à infraestrutura de requisições, não às features.

## Aplicações derivadas

Uma aplicação derivada adiciona contratos próprios ao Shared e os consome na sua API e no seu Web.
Ela não expõe DTOs decorados, entidades ou repositories Core como contratos. Quando especializa um
agregado Core, a integração ocorre por service público e input de domínio interno à API; a fronteira
HTTP da aplicação continua usando contratos Shared próprios.

O catálogo combinado produz o tipo `FunctionalitySlug` usado por controllers e pelo registry Web.
Isso identifica uma funcionalidade implementada, mas não a materializa no banco nem concede
permissão. Consulte [Extensibilidade](./extensibilidade.md) e
[Catálogo de funcionalidades](./catalogo-de-funcionalidades.md).

## Limites de autorização

O Shared pode representar identidades de funcionalidades e ações. Isso não concede permissão. A API
decide autorização por guards, contexto autenticado e regra de negócio; o Web usa o estado da sessão
somente para decidir o que apresentar.

Consulte [Shared](../desenvolvimento/shared.md) para a organização interna e
[Identidade, RBAC e contexto](./identidade-rbac-e-contexto.md) para a regra normativa de acesso.
