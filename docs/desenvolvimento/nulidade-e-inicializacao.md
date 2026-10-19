# Nulidade e inicialização de propriedades

## Objetivo

Os modelos da API devem representar ausência de valor de maneira explícita. Para valores de domínio,
persistência e contratos já normalizados, a ausência é `null`; `undefined` não é um estado de
negócio válido.

```ts
class Example {
  declare description: string | null;
}
```

Não use uma propriedade opcional para expressar nulidade:

```ts
// Incorreto para modelos da aplicação.
description?: string | null;
```

Esse formato obriga todos os consumidores a tratarem `string | null | undefined`, embora o banco e
as regras de negócio distingam apenas valor e ausência explícita.

## Entidades TypeORM

Entidades são materializadas pelo TypeORM, e não pelo construtor da classe. O mesmo princípio vale
para DTOs, respostas e demais classes da API: propriedades declaradas em classes usam `declare`:

```ts
@Column({ name: 'descricao', nullable: true, type: 'varchar' })
declare description: string | null;

@ManyToOne(() => Client, { nullable: false })
declare client: Client;
```

`declare` preserva `strictPropertyInitialization`, não emite uma inicialização de campo em runtime e
elimina a necessidade de `!`. Não use `!` nem `?` em declarações de propriedades de classes da
aplicação para contornar inicialização ou representar ausência. O tipo continua descrevendo o estado
após a entidade ser criada, transformada ou carregada pelo ORM.

As regras de tipo devem acompanhar a persistência:

- coluna ou relação com `nullable: false`: `declare property: Type`;
- coluna ou relação com `nullable: true`: `declare property: Type | null`;
- coleções: `declare property: Type[]`.

## DTOs e fronteiras HTTP

DTOs e objetos recebidos do HTTP podem chegar sem uma chave, pois essa é uma característica do
payload externo. O transformer do DTO é a fronteira de normalização: quando a ausência semântica
for aceita, ele deve converter a entrada para o tipo declarado ou `null`.

Assim, o DTO já entrega `Type | null`, sem `undefined`, para a validação e para os serviços. Um
campo obrigatório ausente permanece inválido e deve ser tratado pela validação; ele não deve
receber um valor padrão silenciosamente.

Transformers compartilhados pertencem a `apps/api/src/shared/transformers/dto`. Eles não devem
preservar uma entrada incompatível para que outro decorator descubra o erro: um transformer de
valor opcional converte ausência ou conteúdo incompatível para `null`. Transformers de coleção
normalizam ausência ou conteúdo incompatível para `[]`. Assim, por exemplo, `toNumber` e
`toOptionalNumber` retornam somente `number | null`, enquanto `toStringArray` retorna somente
`string[]`. Campos obrigatórios continuam sendo rejeitados pelos decorators de validação.

`?` é reservado para estruturas técnicas em que a existência da própria propriedade é relevante,
como extensões de `Request`, opções de função, metadados parciais e payloads externos ainda não
normalizados. Não o use em propriedades de entidades, DTOs normalizados, respostas da API ou
modelos de domínio. Nessas classes, use `declare property: Type | null` quando a ausência for
válida.

## Configuração e revisão

`exactOptionalPropertyTypes` está habilitado na API. Assim, nos casos técnicos em que `?` é
legítimo, atribuir `undefined` exige que isso seja realmente parte do contrato.

Em revisão, verifique que:

- nenhuma propriedade de classe da aplicação usa `!` para inicialização definida ou `?` para
  representar ausência de domínio;
- nulidade no tipo coincide com `nullable` da coluna ou relação;
- transformers de DTO convertem ausência aceitável em `null`, sem deixar `undefined` atravessar
  para validação, serviços, entidades ou respostas;
- campos removíveis em atualizações tenham semântica explícita para `null`.
