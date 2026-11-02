# Persistência

## Banco e ownership

O sistema usa PostgreSQL em um único schema. O contexto de cliente limita autorização e dados; ele nunca escolhe schema, conexão ou datasource.

Entidades pertencentes a cliente devem possuir ownership explícito. Serviços e repositórios aplicam o `clientId` do contexto autenticado em leituras, alterações e exclusões.

As foreign keys recebem nomes semânticos explícitos tanto na migration quanto no `@JoinColumn` da
entidade. Isso permite traduzir violações de integridade sem acoplamento a nomes gerados pelo ORM.

## TypeORM e migrations

- `synchronize` permanece desativado.
- Entidades são explícitas.
- Migrations estruturais e de seed são append-only após serem aplicadas.
- Toda migration possui `up` e `down` coerentes.
- Fixtures de testes não pertencem às migrations de bootstrap.

Uma alteração que preserve invariantes entre vários registros deve usar uma transação única e compartilhar o mesmo `EntityManager` entre os participantes.

## Seeds e exclusão lógica

O bootstrap técnico materializa referências necessárias para operar: idiomas e ações globais,
localização, módulos, funcionalidades de cliente e a identidade administrativa inicial com contexto
de cliente e perfil. Os registros globais não são materializados como funcionalidades nem recebem
vínculos próprios de funcionalidades de cliente.

Somente `User` e `Client` usam exclusão lógica. Para as demais entidades, não introduza `deletedAt` ou comportamento equivalente sem requisito explícito.

Configurações de armazenamento podem ser removidas somente quando o PostgreSQL permitir: regras de
tipo de arquivo ainda vinculadas são protegidas por `RESTRICT`, e a violação da FK é convertida pela
API em uma mensagem de domínio. Não replique essa integridade com consultas prévias apenas para
antecipar o erro do banco.

## Limite operacional

Este documento descreve decisões de modelagem, ownership e evolução do banco. Preparação de
PostgreSQL e Redis, variáveis de ambiente e operações locais pertencem à
[persistência operacional](../infraestrutura/persistencia.md).
