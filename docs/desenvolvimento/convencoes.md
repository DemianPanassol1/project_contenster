# Convenções de desenvolvimento

## Organização da API

Módulos ficam em `apps/api/src/modules` e devem preservar responsabilidade clara:

- controller adapta HTTP;
- service coordena regras de negócio e transações;
- repository concentra queries, filtros, paginação e ownership;
- entity representa persistência;
- DTOs definem contratos de request e response e implementam obrigatoriamente o contrato correspondente do Shared;
- module compõe as dependências do recurso.

Não extraia helpers ou camadas genéricas para uso único. Antes de criar uma estrutura nova, localize a capacidade equivalente e adapte apenas o necessário.

## DTOs, transformação e validação

Cada propriedade recebida por um DTO de request deve usar `@Transform` com o transformer apropriado
de `apps/api/src/shared/transformers/dto`. A transformação normaliza a fronteira HTTP antes da
validação e impede que `undefined` atravesse para a regra de negócio.

Todo decorator de validação deve declarar `message: i18n('validation.<chave>')`. Limites, listas e
outros valores de domínio devem ser constantes nomeadas no módulo responsável; não use números ou
texto soltos no DTO. DTOs também devem expor o contrato HTTP no Swagger com `@ApiProperty` ou
`@ApiPropertyOptional`.

Para um campo opcional, use `@Transform(toOptionalType)`, `@IsOptional()` e
`declare property: Type | null`. Campos obrigatórios usam o transformer do tipo e `declare
property: Type`.

Controllers adaptam HTTP: recebem DTOs, aplicam decorators, delegam ao serviço e escrevem a
resposta de transporte quando necessário. Validação de contexto, seleção de sessão, transição de
estado, exceções de negócio e qualquer mensagem de erro pertencem ao serviço ou a uma capacidade
especializada, nunca ao controller.

## Contratos e Shared

Contratos públicos e tipos compartilhados ficam no Shared. Eles devem ser independentes de NestJS, TypeORM, React e Next.js. Mudanças de contrato exigem revisão dos consumidores API e Web.

## Segurança e legibilidade

- Nunca confie em `clientId`, `profileId` ou permissões enviados pelo navegador.
- Não exponha tokens, senhas, hashes, segredos ou payloads sensíveis em logs.
- Retorne mensagens apropriadas ao consumidor HTTP; erros internos podem permanecer técnicos.
- Use nomes de constraints reais ao tratar conflitos conhecidos de banco.
- Prefira código tipado, local e explícito; comentários explicam decisões não óbvias.
