# Convenções de desenvolvimento

## Organização da API

Módulos ficam em `apps/api/src/modules` e devem preservar responsabilidade clara:

- controller adapta HTTP;
- service coordena regras de negócio e transações;
- repository concentra queries, filtros, paginação e ownership;
- entity representa persistência;
- DTOs definem contratos de request e response;
- module compõe as dependências do recurso.

Não extraia helpers ou camadas genéricas para uso único. Antes de criar uma estrutura nova, localize a capacidade equivalente e adapte apenas o necessário.

## Contratos e Shared

Contratos públicos e tipos compartilhados ficam no Shared. Eles devem ser independentes de NestJS, TypeORM, React e Next.js. Mudanças de contrato exigem revisão dos consumidores API e Web.

## Segurança e legibilidade

- Nunca confie em `clientId`, `profileId` ou permissões enviados pelo navegador.
- Não exponha tokens, senhas, hashes, segredos ou payloads sensíveis em logs.
- Retorne mensagens apropriadas ao consumidor HTTP; erros internos podem permanecer técnicos.
- Use nomes de constraints reais ao tratar conflitos conhecidos de banco.
- Prefira código tipado, local e explícito; comentários explicam decisões não óbvias.
