# Persistência

## Banco e ownership

O sistema usa PostgreSQL em um único schema. O contexto de cliente limita autorização e dados; ele nunca escolhe schema, conexão ou datasource.

Entidades pertencentes a cliente devem possuir ownership explícito. Serviços e repositórios aplicam o `clientId` do contexto autenticado em leituras, alterações e exclusões.

## TypeORM e migrations

- `synchronize` permanece desativado.
- Entidades são explícitas.
- Migrations estruturais e de seed são append-only após serem aplicadas.
- Toda migration possui `up` e `down` coerentes.
- Fixtures de testes não pertencem às migrations de bootstrap.

Uma alteração que preserve invariantes entre vários registros deve usar uma transação única e compartilhar o mesmo `EntityManager` entre os participantes.

## Seeds e exclusão lógica

O bootstrap técnico materializa referências necessárias para operar: idiomas, ações, localização, módulos, funcionalidades e a identidade administrativa inicial com contexto de cliente e perfil.

Somente `User` e `Client` usam exclusão lógica. Para as demais entidades, não introduza `deletedAt` ou comportamento equivalente sem requisito explícito.
