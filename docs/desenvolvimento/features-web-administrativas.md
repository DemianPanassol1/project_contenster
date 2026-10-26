# Features Web administrativas

Este documento define o padrão para implementar uma funcionalidade administrativa protegida no
Web. A referência inicial é `apps/web/src/features/admin/modules`.

O padrão se aplica às funcionalidades registradas em `/admin/<functionality>`. Ele não se aplica
às rotas públicas, autenticação ou painel global, que possuem providers, layouts e regras de
acesso próprios.

## Pré-requisitos

Antes de criar a interface, confirme que a capacidade já possui:

1. contrato público em `apps/shared`;
2. endpoints e DTOs na API;
3. autorização da API com `RequirePermission` e o slug do catálogo Shared;
4. binding no registry administrativo do Web;
5. textos nos três arquivos de `apps/web/src/i18n/messages/protected`.

O Web usa permissões apenas para apresentar ações disponíveis. A API continua sendo a fonte de
verdade para autorização, contexto de cliente e regras de negócio.

## Estrutura da feature

Uma feature administrativa deve ficar em `apps/web/src/features/admin/<recurso>`:

```text
features/admin/<recurso>/
├── components/
│   └── <Resource>Form.tsx
├── hooks/
│   └── use<Resource>Columns.tsx
├── pages/
│   ├── <Resource>ListView.tsx
│   └── <Resource>SaveView.tsx
├── utils/
│   └── <resource>.utils.ts
└── index.ts
```

Crie somente as pastas que tenham responsabilidade real:

- `components/`: componentes de apresentação reutilizados dentro da própria feature, como o
  formulário;
- `hooks/`: hooks de apresentação, como colunas que dependem de `useTranslations`;
- `pages/`: views ligadas pelos modos do registry;
- `utils/`: mapeamento puro de valores iniciais, resposta de detalhe e payload de escrita;
- `index.ts`: exporta somente as views que o registry precisa consumir.

Não crie `types/` quando os contratos do Shared já representam o formulário, a listagem e o
detalhe. Um tipo local só é justificável para estado exclusivamente visual que não pertença ao
contrato HTTP.

## Registry e rotas protegidas

O binding fica em `apps/web/src/registry/admin/<dominio>`. Ele associa cada modo à action
necessária e à view da feature:

```tsx
{
  slug: CORE_FUNCTIONALITY_IDENTITIES.modules,
  modes: {
    list: { action: ActionType.view, View: SystemModulesListView },
    create: { action: ActionType.create, View: SystemModuleSaveView },
    update: { action: ActionType.edit, View: SystemModuleSaveView },
  },
}
```

As páginas genéricas em `app/[locale]/(protected)/admin/[functionality]` resolvem a sessão, a
apresentação da funcionalidade e o binding. A action do binding deve ser checada com
`hasPermissionAction(presentation.actions, binding.action)` antes de renderizar a view.

Use os helpers de `features/shared/navigation` para paths administrativos e parâmetros:

```ts
crudListPath(CORE_FUNCTIONALITY_IDENTITIES.modules);
crudCreatePath(CORE_FUNCTIONALITY_IDENTITIES.modules);
crudUpdatePath(CORE_FUNCTIONALITY_IDENTITIES.modules, id);
parseIdParam(routeParam);
```

Os helpers já incluem `/admin`, codificam o segmento de rota e deixam o locale a cargo da
navegação do `next-intl`. Não monte paths protegidos manualmente dentro das views.

## Endpoints e contratos

Endpoints HTTP usados pelo Web pertencem a `apps/web/src/routes`. Use `API_ROUTES` nas actions,
views, hooks e componentes:

```ts
API_ROUTES.ADMIN.POST_SYSTEM_MODULE_LIST;
API_ROUTES.ADMIN.GET_SYSTEM_MODULE(id);
API_ROUTES.ADMIN.POST_SYSTEM_MODULE;
```

Não use strings de endpoint fora dessa estrutura. A URL base, autenticação de sessão, `x-lang` e
normalização de respostas pertencem à API instance e às Server Actions, não à feature.

## Listagem

A view de listagem é responsável por compor a página, não por implementar tabela ou paginação:

```tsx
<Page module={presentation.moduleName} functionality={presentation.functionalityName}>
  <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
    <DataTable endpoint={API_ROUTES.ADMIN.POST_SYSTEM_MODULE_LIST} />
  </Paper>
</Page>
```

- `Page` apresenta módulo, funcionalidade, descrição e ações de topo;
- `Paper` preserva o contêiner visual administrativo;
- `DataTable` concentra busca, filtros, ordenação, paginação, seleção e confirmação de exclusão;
- colunas ficam em um hook quando precisam de traduções ou renderização própria;
- visibilidade de criar, editar, excluir e exportar vem de `hasPermissionAction`;
- o caminho de edição deve ser informado com `crudUpdatePath` quando a feature usa a rota CRUD
  padrão;
- mensagens que dependem da quantidade de registros usam callback, por exemplo
  `manyMessage: (count) => t('delete_many_message', { count: String(count) })`.

Os campos marcados como pesquisáveis, ordenáveis ou filtráveis devem corresponder aos selectors
aceitos pelo endpoint de listagem. Uma coluna meramente exibida não deve declarar uma capacidade
de consulta que a API não suporta.

## Criação e edição

A view de criação e edição reutiliza a mesma `SaveView`. Ela recebe `entityId: number | null` do
registry: `null` significa criação; um número válido significa edição.

```tsx
<Page actions={formActions}>
  <FormWrapper
    fields={getResourceDefaultValues(presentation.languages)}
    contentUrl={isEditing ? API_ROUTES.ADMIN.GET_RESOURCE(entityId) : undefined}
    mapContent={(content) => mapResourceContent(content, presentation.languages)}
    onSubmit={saveResource}
  >
    <ResourceForm languages={presentation.languages} />
  </FormWrapper>
</Page>
```

- `FormWrapper` controla `react-hook-form`, carregamento de detalhe, erro e hidratação;
- a página orquestra requisição, navegação e ações de salvar/voltar;
- o componente de formulário contém somente campos e disposição visual;
- `utils/` mantém funções puras de valores iniciais, hidratação e normalização do payload;
- use `useValidationRules` e `createValidationRules`; não crie validações ad hoc nos campos;
- use componentes compartilhados de `src/shared`, como `FormInput`, `FormSwitch`,
  `TranslationsFields`, `Button` e `FormWrapper`.

A disposição dos campos deve ser controlada por `Box` com `display: 'grid'`, usando breakpoints
em `sx`. Campos que precisam ocupar toda a linha devem declarar `gridColumn`; não use margens
isoladas para simular o layout.

## Traduções de conteúdo

Para entidades traduzidas, os idiomas vêm de `presentation.languages`, cuja interface de sessão
usa `locale`, nunca `languageCode`.

Os valores iniciais e a hidratação devem conter uma entrada para cada idioma habilitado do cliente:

```ts
{
  id: translation?.id ?? null,
  locale: language.locale,
  name: translation?.name ?? '',
  description: translation?.description ?? null,
}
```

Preserve o `id` de cada tradução existente. `id: null` representa uma tradução nova. Não reduza a
coleção aos idiomas que já possuem texto, pois isso impede o cadastro de idiomas recém-habilitados
e pode remover filhos persistidos no salvamento.

## Nomes e funções

- Use `<Resource>ListView` e `<Resource>SaveView` para views ligadas ao registry;
- use `<Resource>Form` para formulário reutilizado entre criação e edição;
- use `get<Resource>DefaultValues`, `map<Resource>Content` e `map<Resource>Payload` para
  transformações puras e explícitas;
- use `use<Resource>Columns` para colunas da tabela;
- prefira funções pequenas com responsabilidade única e guard clauses para fluxos inválidos;
- não introduza wrappers de requisição, paths ou permissões dentro da feature quando já existirem
  `API_ROUTES`, `apiRequest` e os helpers de navegação.

## Checklist

- O slug é importado do catálogo Shared e registrado no domínio correto?
- Os modos do binding correspondem à UX realmente disponível?
- A API usa o mesmo slug e action em `RequirePermission`?
- Endpoints vêm de `API_ROUTES`?
- Paths vêm de `features/shared/navigation`?
- O formulário usa contratos Shared, componentes compartilhados e validação centralizada?
- Traduções usam `SessionLanguage.locale` e preservam IDs filhos?
- Chaves de interface foram incluídas em `protected/pt.json`, `protected/en.json` e
  `protected/es.json` com paridade?
- A lista só declara filtros e ordenações suportados pela API?
- Lint, tipagem, build e `git diff --check` foram executados?
