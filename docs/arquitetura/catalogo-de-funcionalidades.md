# Catálogo de funcionalidades

O catálogo técnico fica em `apps/shared/src/catalog`. Ele descreve funcionalidades físicas conhecidas pelo sistema e fornece identidades estáveis para Shared, API e Web.

## Limites

O catálogo não é banco de dados, lista de permissões concedidas, registro de rotas, componente React, configuração de módulo, ícone, ordenação, tradução ou estado de ativação. Essas responsabilidades pertencem à persistência, ao RBAC ou ao Web.

## Autoridades separadas

```text
Catálogo estático              -> funcionalidades implementadas
Funcionalidade + perfil        -> autorização persistida
Sessão + guards + serviços     -> autorização em runtime
Web                            -> apresentação e navegação
```

Existir no catálogo não concede permissão nem cria automaticamente uma tela.

## Guards de permissão da API

Controllers usam `RequirePermission` com uma identidade exportada pelo catálogo e nunca com uma
string solta. Desestruture a identidade do recurso uma vez no topo do controller — por exemplo,
`const { cities } = CORE_FUNCTIONALITY_IDENTITIES` — e use `cities` em todos os decorators do
mesmo controller. O decorator aceita somente `FunctionalitySlug`, portanto uma funcionalidade
inexistente no catálogo não é aceita pela tipagem.

Quando uma mesma rota persiste criação e edição, o decorator recebe a ação de criação e informa
`bodyIdField: 'id'` com `updateActionType: ActionType.edit`. O guard decide a ação antes de
delegar ao service: identificador positivo usa edição; `null`, ausente ou inválido usa criação.
Essa decisão é de autorização HTTP e não deve ser reimplementada nos controllers.

## Bootstrap e evolução

O seed inicial materializa idiomas, ações e um modelo de acesso administrativo global. O modelo
declara módulos, funcionalidades, ícones, estados, ordem e traduções em português, inglês e
espanhol para clientes, usuários, perfis, funcionalidades, módulos, cidades, estados, países,
armazenamento do cliente e logs do cliente. Ele não cria recursos vinculados a nenhum cliente:
essas funcionalidades são materializadas somente quando o modelo é aplicado ao cliente.

Idiomas e ações são registros globais necessários para traduções e RBAC, mas não são funcionalidades
catalogadas nem recebem binding ou permissão de cliente.

`client-storage` reúne configurações de provedor, regras por tipo de arquivo e consulta dos arquivos
do cliente. `client-logs` reúne a consulta dos logs de requisição acessíveis ao cliente ativo — logs
do próprio cliente e técnicos sem cliente — e a consulta independente dos logs de rotinas. Ambas são
funcionalidades administrativas únicas; a separação em listas ou abas é responsabilidade de apresentação.

Ao adicionar uma funcionalidade, registre sua identidade no Shared, materialize-a por migration ou fluxo autorizado, associe ações por permissões de perfil e crie tela somente quando houver uma superfície real.

## Aplicações derivadas

Uma aplicação derivada compõe seu catálogo estático sobre o Core. Seus slugs passam a integrar
`FunctionalitySlug`, permitindo que controllers, guards e bindings administrativos usem a mesma
identidade tipada. A derivação deve incluir também as definições completas no seed ou modelo de
acesso correspondente; a existência do slug isoladamente não cria registros de módulo ou
funcionalidade para cliente algum.

Uma derivação pode substituir explicitamente a view Web associada a um slug Core, mas não deve
duplicar sua identidade técnica. Consulte [Extensibilidade](./extensibilidade.md) para os limites de
composição.

Migrations guardam seu próprio snapshot de dados em conjunto com o JSON versionado em
`apps/api/src/database/seeds`. Uma migration histórica nunca deve importar o catálogo atual em runtime,
pois mudanças futuras não podem alterar seu significado.
