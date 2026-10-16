# Identidade, RBAC e contexto

## Modelo de acesso

```text
Usuário -> Perfil -> Cliente
                 -> Permissões por funcionalidade e ação
```

O perfil pertence a um cliente. Um usuário pode ter vínculos com vários clientes, mas não pode ter dois perfis no mesmo cliente. Essa regra deve ser garantida pela persistência, não apenas por validação de serviço.

## Autenticação e sessão

1. A API valida usuário e senha sem revelar qual credencial falhou.
2. A API retorna os clientes ativos para os quais o usuário possui vínculo elegível.
3. O usuário escolhe um cliente e a API resolve o único perfil correspondente.
4. A API monta a árvore de funcionalidades e permissões para o contexto.
5. Um token opaco é entregue ao Web e armazenado em cookie HTTP-only.
6. O estado da sessão fica no Redis; PostgreSQL continua autoritativo.

O estado persistido no Redis inclui contexto, autorização calculada e informações de revogação e expiração. Uma reinicialização do Redis invalida sessões e exige nova autenticação.

## Troca de contexto e isolamento

A troca de contexto ocorre por rota autenticada. Ela valida novamente usuário, cliente, perfil e vínculo persistido, rotaciona a sessão conforme a política definida e emite novo token opaco.

Não existe contexto global, perfil virtual ou troca administrativa para cliente sem vínculo. Em requests protegidos, a API deve revalidar usuário, cliente, perfil e vínculo. Uma sessão em cache não pode manter autorizado um usuário bloqueado, um cliente inativo ou um perfil desativado.

Toda consulta ou escrita pertencente a cliente deve usar o `clientId` confiável do contexto autenticado. Um identificador recebido no corpo, query, rota ou header não comprova acesso.

## Autorização

RBAC é deny-by-default. Guards e serviços exigem funcionalidade e ação adequadas; regras de ownership continuam no caso de uso específico. O slug isolado não deve ser tratado como identidade suficiente fora do limite definido pelo catálogo.
