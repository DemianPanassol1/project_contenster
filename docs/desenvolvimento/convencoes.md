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

## Coleções aninhadas e persistência

Quando um cadastro edita uma coleção filha persistida — por exemplo, traduções, idiomas habilitados
ou permissões de perfil — cada item existente deve circular com seu próprio `id`. O request usa
`id: number | null`: `null` cria um filho e um identificador existente o atualiza. A resposta de
detalhe sempre devolve o `id` efetivo de cada item para viabilizar a edição seguinte.

O service valida relações de domínio e ownership. O repository não deve consultar a coleção atual
para reconstruir IDs por idioma, combinação de chaves ou mapas auxiliares; ele persiste exatamente
a árvore já validada pelo serviço. Coleções ausentes no payload são removidas por
`orphanedRowAction: 'delete'` quando a entidade adota essa semântica.

É proibido atualizar coleções filhas por exclusão global seguida de recriação (`DELETE` seguido de
novos `INSERT`s). Essa abordagem descarta identidades persistidas, produz escrita desnecessária e
torna o agregado mais vulnerável a falhas intermediárias. Coleções editáveis devem preservar os IDs
dos itens existentes, usar `id: null` para novos itens, ter `cascade: true` no agregado e
`orphanedRowAction: 'delete'` na relação filha. Exclusão em lote é aceitável somente para a remoção
explícita do próprio recurso ou para rotinas de retenção técnica; nunca como mecanismo de atualização
de uma coleção.

Mantenha um decorator por linha, imediatamente acima da propriedade a que se aplica. Separe os
blocos de propriedades por uma linha em branco. Esse espaçamento é obrigatório inclusive em DTOs
pequenos e em DTOs auxiliares aninhados.

Controllers adaptam HTTP: recebem DTOs, aplicam decorators, delegam ao serviço e escrevem a
resposta de transporte quando necessário. Validação de contexto, seleção de sessão, transição de
estado, exceções de negócio e qualquer mensagem de erro pertencem ao serviço ou a uma capacidade
especializada, nunca ao controller.

## CRUD administrativo padrão

Salvo quando um comportamento específico justificar outra superfície, um cadastro administrativo
expõe quatro operações:

- `POST /<recurso>/list`, com `PaginateRequestDto`, para listagem paginada;
- `GET /<recurso>/:id`, para detalhe;
- `POST /<recurso>`, para criar ou atualizar;
- `POST /<recurso>/delete`, com `DeleteRecordsRequestDto`, para uma ou várias exclusões.

`PaginateRequestDto` é a convenção para listagens. Seu campo `isOptional` permanece disponível
para endpoints de opções: quando aplicável, a resposta pode incluir a opção vazia de seleção.
Isso não altera automaticamente a resposta de uma listagem administrativa comum.

O controller contém somente a adaptação HTTP e os decorators de autorização. O service busca e
valida entidades relacionadas, resolve traduções, impede transições inválidas, decide erros de
negócio e converte a resposta com `toResponseDto`. O repository contém exclusivamente consultas,
paginação, transações e comandos de persistência. Antes de excluir, o service deve pedir ao
repository a verificação dos vínculos que impedem a remoção e retornar um erro de negócio
traduzido; não dependa apenas da falha de constraint do banco.

Para cadastros traduzidos, obtenha o locale com `getCurrentLocale()` e use `resolveTranslation()`.
O helper aplica locale solicitado, fallback padrão e tradução disponível sem repetir esse algoritmo
nos serviços. A validação dos idiomas enviados para persistência usa
`resolveTranslationLanguages()`.

Organize controllers, services e repositories com uma linha em branco entre métodos. Separe
também constantes de módulo e etapas lógicas do método — consulta, validação, persistência e
retorno. Não comprima condicionais, fluxos de exclusão ou objetos de persistência em uma única
linha apenas para reduzir o arquivo.

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

O Core não mantém compatibilidade automática com formatos antigos de contratos de sessão ou de
respostas HTTP. O Web não deve detectar propriedades ausentes para disparar sincronização,
repetir requisições, reescrever payloads ou aceitar formatos legados. Uma mudança de contrato
atualiza API, Shared e Web de forma coordenada. Se uma migração de sessões persistidas for
realmente necessária, ela deve ser uma decisão explícita e uma estratégia centralizada na API;
nunca uma heurística por campo no consumidor Web.

## Chaves estrangeiras e constraints

Toda relação persistida deve declarar explicitamente `foreignKeyConstraintName` em `@JoinColumn` — ou `name` em `@ForeignKey` quando a relação integra uma constraint composta manual — e a migration correspondente deve criar e remover a constraint com o mesmo nome. Os nomes devem ser semânticos, estáveis e em minúsculas, por exemplo `fk_estados_pais`; nunca dependa dos identificadores automáticos e hashados gerados pelo TypeORM.

Não duplique uma coluna de chave estrangeira com `@Column` apenas para expor seu identificador quando a relação já fornece o vínculo necessário. A exceção é uma coluna física exigida por uma constraint ou índice composto; nesse caso, a dependência deve permanecer explícita e ser documentada junto à entidade.

## Enumeradores e opções localizadas

Todo enumerador público do projeto deve possuir um dicionário colocalizado ao enum no Shared. O
dicionário é exaustivo e tipado com `Record<Enum, string>`; ele associa o valor técnico persistido
a uma chave `enums.*`, nunca ao texto apresentado ao usuário. A chave é interna à implementação e
deve existir nos arquivos `enums.json` dos três idiomas da API.

Quando uma rota expuser opções de um enumerador, ela deve devolver `AppOption<TValue>`. `value` é
o valor original reconhecido pelo banco e `label` é resolvido pela API no idioma da requisição.
`createEnumOptions` inicializa `disabled` e `metadata` como `null`; a rota pode preenchê-los quando
houver uma regra específica. Não exponha somente a chave de tradução e não substitua o valor
técnico pelo texto localizado. Use `createEnumOptions` para construir essas opções a partir do
dicionário e do tradutor da requisição.

## Segurança e legibilidade

- Nunca confie em `clientId`, `profileId` ou permissões enviados pelo navegador.
- Não exponha tokens, senhas, hashes, segredos ou payloads sensíveis em logs.
- Retorne mensagens apropriadas ao consumidor HTTP; erros internos podem permanecer técnicos.
- Use nomes de constraints reais ao tratar conflitos conhecidos de banco.
- Prefira código tipado, local e explícito; comentários explicam decisões não óbvias.
