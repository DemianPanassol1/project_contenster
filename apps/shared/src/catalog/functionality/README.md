# Catálogo de funcionalidades

## Responsabilidade

O catálogo é a fonte técnica e estática dos slugs de funcionalidades que pertencem ao Slim Core.
Ele fornece uma identidade estável para o banco, a API, a sessão autenticada e o binding de telas
administrativas no Web.

O catálogo não é uma tabela do banco e não materializa registros automaticamente. A migration de
bootstrap persiste as funcionalidades iniciais; novos registros devem ser incluídos explicitamente
em uma migration ou seed compatível. O catálogo também não contém rótulos, traduções, componentes
React, rotas, IDs numéricos, ações ou permissões concedidas.

```text
catálogo Shared ── identidade técnica ──> migration / banco
       │                                      │
       ├──────────────────────────────> API / RequirePermission
       └──────────────────────────────> registry administrativo do Web
```

A autorização continua sendo determinada exclusivamente pela API, a partir de usuário, cliente,
perfil e permissões armazenadas. Um slug existir no catálogo não concede acesso a ninguém.

## O que é um slug

Um slug é uma chave técnica estável em `kebab-case`, como `client-storage` ou `client-logs`.
Ele deve representar uma capacidade administrativa, e não uma tela específica, uma ação ou um
produto externo.

Regras:

- não use IDs de banco, nomes traduzidos, nomes de componentes ou paths HTTP;
- não reutilize um slug removido para outro significado;
- não renomeie um slug já materializado sem migration de compatibilidade, atualização de catálogo,
  permissões e bindings Web;
- mantenha o mesmo slug para a funcionalidade persistida, o decorator `RequirePermission` e o
  registry Web;
- ações como `view`, `create`, `edit` e `delete` pertencem ao modelo de autorização, não ao slug.

## Estrutura atual

```text
functionality/
├── core/
│   ├── core-functionality.catalog.ts
│   └── index.ts
├── functionality-catalog.type.ts
├── functionality-catalog.util.ts
├── functionality.catalog.ts
└── index.ts
```

`core/` reúne somente as capacidades que fazem parte do núcleo administrativo atual: clientes,
usuários, RBAC, locations, idiomas, storage e logs. Ele não é um local genérico para qualquer
capacidade futura.

`FUNCTIONALITY_CATALOG` compõe todos os catálogos de domínio e deriva `FunctionalitySlug`.
`isFunctionalitySlug` é a verificação de fronteira para strings externas; dentro do código tipado,
prefira sempre o tipo derivado em vez de strings livres.

## Como adicionar um novo domínio

Antes de criar arquivos, confirme que a capacidade pertence ao Slim Core. Produtos, portais,
orchestrator, administração global e fluxos de outro contexto não devem entrar aqui.

Para um domínio distinto de `core`, use esta estrutura como destino:

```text
functionality/
├── core/
├── <domain>/
│   ├── <domain>-functionality.catalog.ts
│   └── index.ts
├── functionality.catalog.ts
└── ...
```

Exemplo conceitual para um domínio `billing`:

```ts
export const BILLING_FUNCTIONALITY_IDENTITIES = {
  invoices: 'invoices',
  paymentMethods: 'payment-methods',
} as const;

export const BILLING_FUNCTIONALITY_CATALOG = [
  { slug: BILLING_FUNCTIONALITY_IDENTITIES.invoices },
  { slug: BILLING_FUNCTIONALITY_IDENTITIES.paymentMethods },
] as const;
```

Depois, siga esta sequência na mesma alteração:

1. Exporte o catálogo do domínio pelo respectivo `index.ts`.
2. Inclua suas entradas em `FUNCTIONALITY_CATALOG`.
3. Garanta que não exista slug duplicado entre domínios.
4. Crie a migration/seed que materializa o módulo, a funcionalidade, traduções e permissões iniciais
   necessárias para cada cliente.
5. Use a identidade exportada no `RequirePermission` dos endpoints protegidos.
6. Crie o binding de apresentação no registry Web somente se a capacidade possuir superfície
   administrativa roteável.
7. Cubra bootstrap e autorização nos testes de integração/e2e.

## Limitação transitória de tipagem

Os tipos atuais ainda se chamam `CoreFunctionalityDefinition` e `CoreFunctionalitySlug`, e o
registry administrativo usa `CoreFunctionalitySlug`. Isso é adequado enquanto `core` for o único
domínio existente, mas não deve ser estendido semanticamente para acomodar outro domínio.

Na primeira expansão fora de `core`, generalize esses contratos na mesma mudança para nomes como
`FunctionalityDefinition` e `FunctionalitySlug`. O registry Web também deve passar a aceitar o tipo
global. Preserve `CoreFunctionalitySlug` apenas como subtipo/export específico se ele continuar útil
para consumidores do Core.

## Checklist de revisão

- A capacidade pertence ao escopo do Slim Core?
- O slug é único, técnico e estável?
- A entrada foi composta no catálogo global?
- A migration materializa dados consistentes com o catálogo?
- A API usa o slug tipado no decorator de permissão?
- O Web possui binding apenas quando há uma tela administrativa?
- Nenhuma ação, rota, rótulo ou ID de banco foi introduzido no catálogo?
- Os testes cobrem bootstrap, RBAC e isolamento por cliente quando aplicável?
