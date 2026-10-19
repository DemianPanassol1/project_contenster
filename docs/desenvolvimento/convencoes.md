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

## DTOs de entrada, transformação e validação

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

DTOs de request ficam em `dto/req`. Cada DTO ocupa seu próprio arquivo, cujo nome deixa explícito
o caso de uso, por exemplo `save-client.request.dto.ts`. DTOs auxiliares usados somente para uma
propriedade aninhada — como uma tradução — pertencem ao mesmo arquivo e módulo do request que os
consome; não crie DTOs compartilhados de tradução. Cada módulo pode evoluir seu próprio payload de
tradução sem acoplamento com os demais.

Mantenha um decorator por linha, imediatamente acima da propriedade a que se aplica. Separe os
blocos de propriedades por uma linha em branco. Esse espaçamento é obrigatório inclusive em DTOs
pequenos e em DTOs auxiliares aninhados.

Controllers adaptam HTTP: recebem DTOs, aplicam decorators, delegam ao serviço e escrevem a
resposta de transporte quando necessário. Validação de contexto, seleção de sessão, transição de
estado, exceções de negócio e qualquer mensagem de erro pertencem ao serviço ou a uma capacidade
especializada, nunca ao controller.

## DTOs de saída e serialização

Todo payload público devolvido por um service deve passar por uma DTO de resposta que implementa o
contrato correspondente do Shared. DTOs de saída ficam em `dto/res`, usam `@Expose` em cada campo
permitido, `@Type` para propriedades aninhadas, `@ApiProperty` ou `@ApiPropertyOptional` para o
Swagger e `declare` nas propriedades de classe.

Cada DTO de saída ocupa seu próprio arquivo em `dto/res`; itens de listagem, detalhes e respostas
de operações diferentes não são agrupados no mesmo arquivo. A formatação segue o mesmo padrão dos
DTOs de entrada: um decorator por linha, decorators imediatamente acima da propriedade e uma linha
em branco entre blocos de propriedades. Exemplo:

```ts
@Expose()
@ApiProperty()
declare id: number;

@Expose()
@ApiPropertyOptional({ nullable: true })
declare description: string | null;
```

O service deve criar o payload de domínio e convertê-lo explicitamente com `toResponseDto`. Não
retorne entidades TypeORM, objetos de repositório ou objetos literais diretamente ao controller.
DTOs aninhadas também devem implementar seus contratos quando esses contratos existirem, inclusive
para árvores recursivas.

Dados necessários apenas para transporte técnico não pertencem à DTO pública. Por exemplo, o token
opaco e o TTL que permitem escrever um cookie HTTP-only podem circular em um resultado interno do
serviço, mas não recebem `@Expose`, não entram no contrato Shared, Swagger ou corpo HTTP.

## Contratos e Shared

Contratos públicos e tipos compartilhados ficam no Shared. Eles devem ser independentes de NestJS, TypeORM, React e Next.js. Mudanças de contrato exigem revisão dos consumidores API e Web.

## Segurança e legibilidade

- Nunca confie em `clientId`, `profileId` ou permissões enviados pelo navegador.
- Não exponha tokens, senhas, hashes, segredos ou payloads sensíveis em logs.
- Retorne mensagens apropriadas ao consumidor HTTP; erros internos podem permanecer técnicos.
- Use nomes de constraints reais ao tratar conflitos conhecidos de banco.
- Prefira código tipado, local e explícito; comentários explicam decisões não óbvias.
