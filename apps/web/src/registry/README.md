# Registry de funcionalidades administrativas

## Responsabilidade

O registry associa uma funcionalidade conhecida do catálogo Shared a uma tela React e ao modo de
operação administrativo correspondente. Ele resolve a apresentação de rotas como
`/admin/<functionality>`, `/admin/<functionality>/create` e
`/admin/<functionality>/update/<id>`.

Ele não concede autorização, não consulta o banco, não substitui guards da API e não é a fonte de
verdade da sessão. A tela pode ser exibida apenas como conveniência de navegação; toda leitura e
escrita continua protegida pela API com a sessão autenticada e `RequirePermission`.

```text
Shared catalog ── slug tipado ──> Web registry ──> componente React
       │                                │
       └──────────── API / RBAC <───────┘
```

Rotas públicas e de autenticação não participam do registry.

## Estrutura atual

```text
registry/
├── admin/
│   ├── core/
│   │   └── core-admin.registry.tsx
│   ├── admin.registry.ts
│   ├── admin.registry.type.ts
│   └── index.ts
└── README.md
```

- `core/core-admin.registry.tsx` declara bindings das funcionalidades do Core.
- `admin.registry.ts` agrega os bindings, detecta slugs duplicados e expõe
  `getAdminFeatureBinding`.
- `admin.registry.type.ts` define os modos, a action esperada e o contrato de props das views.

## Modos e ações

Os modos aceitos são:

| Modo     | Rota administrativa esperada         | Action associada     |
| -------- | ------------------------------------ | -------------------- |
| `list`   | `/admin/<functionality>`             | normalmente `view`   |
| `create` | `/admin/<functionality>/create`      | normalmente `create` |
| `update` | `/admin/<functionality>/update/<id>` | normalmente `edit`   |

O campo `action` orienta a camada de apresentação sobre a permissão necessária para aquele modo.
Ele não é uma garantia de acesso: se a API negar a requisição, a interface deve tratar a resposta
normalmente.

Uma funcionalidade pode expor somente `list`, como `client-storage` e `client-logs`, quando sua UX
for uma página única com modais e salvamento interno. Não crie artificialmente modos `create` ou
`update` apenas para se adequar ao padrão dos demais CRUDs.

Cada `View` recebe:

```ts
type AdminFeatureViewProps = {
  entityId: string | null;
  functionalitySlug: FunctionalitySlug;
};
```

`entityId` é `null` em listagem/criação e contém o parâmetro da rota em edição. A view deve validar
e converter esse valor conforme o contrato da API; o registry não transforma nem valida payloads.

## Como adicionar um binding do Core

1. Confirme que o slug já existe em `apps/shared/src/catalog/functionality` e foi materializado no
   banco por migration/seed.
2. Crie ou importe a view React responsável pela funcionalidade.
3. Adicione o binding em `admin/core/core-admin.registry.tsx`, usando a identidade exportada pelo
   catálogo em vez de uma string literal quando possível.
4. Declare apenas os modos realmente suportados e associe a action adequada.
5. Verifique que o mesmo slug é protegido na API por `RequirePermission`.
6. Adicione testes ou validação da rota administrativa e da negação da API quando aplicável.

Exemplo:

```tsx
{
  slug: CORE_FUNCTIONALITY_IDENTITIES.users,
  modes: {
    list: { action: ActionType.view, View: UsersListView },
    create: { action: ActionType.create, View: UserFormView },
    update: { action: ActionType.edit, View: UserFormView },
  },
}
```

## Como expandir para outro domínio

Não adicione funcionalidades de outro domínio ao arquivo `core-admin.registry.tsx`. Crie um grupo
paralelo, por exemplo:

```text
admin/
├── core/
│   └── core-admin.registry.tsx
├── billing/
│   └── billing-admin.registry.tsx
└── admin.registry.ts
```

Depois, importe e componha `BILLING_ADMIN_FEATURE_BINDINGS` em `admin.registry.ts`, ao lado dos
bindings do Core. O `Map` já deve continuar rejeitando slugs duplicados entre grupos.

Hoje os tipos do registry ainda estão restritos a `CoreFunctionalitySlug`. Antes de compor um grupo
fora de `core`, generalize-os para o `FunctionalitySlug` global no Shared. Essa alteração deve ser
feita junto com a expansão do catálogo; não contorne a tipagem com casts ou strings soltas.

## Regras de manutenção

- Não duplique um slug: um slug pode ter somente um binding administrativo por modo.
- Não use labels traduzidos, paths HTTP ou IDs numéricos como chaves do registry.
- Não crie uma view para capacidade que ainda não possui API, contratos e permissão definidos.
- Não esconda uma falha de autorização apenas removendo a tela; a API deve continuar a negar acesso.
- Mantenha bindings pequenos: composição e resolução ficam no registry, comportamento de tela fica
  no componente da feature.
- Ao remover uma funcionalidade, remova seu binding, rota e dados de bootstrap de forma coordenada;
  nunca reutilize o slug para outro propósito.

## Checklist de revisão

- O slug vem do catálogo Shared e é único?
- O domínio foi alocado fora de `core` quando não pertence ao núcleo?
- Os modos correspondem às rotas e UX realmente implementadas?
- Cada modo usa a action correta?
- A API possui `RequirePermission` com o mesmo slug e action?
- O binding não introduz autorização client-side como fonte de verdade?
- A expansão preserva a tipagem sem casts?
