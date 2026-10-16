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

## Bootstrap e evolução

O seed inicial materializa módulos, funcionalidades, idiomas e ações. As funcionalidades iniciais cobrem clientes, usuários, perfis, funcionalidades, módulos, cidades, estados e países.

Ao adicionar uma funcionalidade, registre sua identidade no Shared, materialize-a por migration ou fluxo autorizado, associe ações por permissões de perfil e crie tela somente quando houver uma superfície real.

Migrations guardam seu próprio snapshot de dados. Uma migration histórica nunca deve importar o catálogo atual em runtime, pois mudanças futuras não podem alterar seu significado.
