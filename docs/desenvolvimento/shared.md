# Shared

## Responsabilidade

`apps/shared` contém elementos públicos que API e Web podem consumir sem importar um ao outro. Sua
estrutura atual inclui `catalog`, `contracts`, `domain`, `platform` e `utils`.

- `contracts`: interfaces e formatos compartilhados por domínio;
- `domain`: tipos e enumeradores de domínio;
- `platform`: contratos técnicos, como HTTP, paginação, opções e sessão;
- `catalog`: identidades técnicas de funcionalidades conhecidas;
- `utils`: utilitários independentes de framework.

## Estrutura representativa

```text
apps/shared/src/
├── catalog/
│   └── functionality/
│       └── core/
├── contracts/
│   └── <domain>/<resource>/
│       ├── <resource>.contract.ts
│       └── index.ts
├── domain/
│   └── <domain>/
├── platform/
│   ├── http/
│   ├── pagination/
│   └── session/
├── utils/
└── index.ts
```

Esta árvore descreve a organização existente, não uma obrigação de criar todos os níveis para cada
tipo. Um contrato de recurso usa `contracts/<domínio>/<recurso>` e é reexportado pelos `index.ts`
ancestrais; tipos técnicos comuns pertencem a `platform`, e não a um domínio de aplicação.

## Exemplo ilustrativo: contrato e export

```typescript
// contracts/<domain>/example/example.contract.ts
export interface SaveExampleRequest {
  id: number | null;
  isActive: boolean;
}

// contracts/<domain>/example/index.ts
export * from './example.contract.js';
```

O ponto de entrada `apps/shared/src/index.ts` reexporta contratos, catálogo, domínio, plataforma e
utilitários públicos. **Convenção recomendada:** exponha somente o que API e Web precisam consumir;
um arquivo interno não deve virar parte do contrato apenas por conveniência.

## Limites

O pacote não importa NestJS, Next.js, React, TypeORM, entidades, repositories, controllers nem
componentes de interface. Ele não contém persistência, decisão de autorização, roteamento ou estado
de tela.

```typescript
// Correto: contrato sem dependência de framework.
export interface ExampleResponse {
  id: number;
}

// Incorreto: decorators e implementação de transporte pertencem à API.
// import { ApiProperty } from '@nestjs/swagger';
```

**Regra obrigatória:** o Shared mantém independência de framework. A comparação é ilustrativa; não
introduz uma API nova nem substitui os contratos existentes.

O catálogo é uma fonte estática de identidade técnica; não é uma lista de permissões concedidas nem
um substituto para dados persistidos. Consulte
[Catálogo de funcionalidades](../arquitetura/catalogo-de-funcionalidades.md) para essa separação.

## Evolução

Exporte apenas o que precisa ser consumido pelas aplicações. Ao mudar um contrato, revise API e Web
em conjunto e mantenha detalhes específicos no proprietário correto. Não transfira DTOs decorados,
entidades ou implementação de transporte para o Shared apenas para reutilização aparente.

Consulte [Contratos e integração](../arquitetura/contratos-e-integracao.md) para a fronteira entre
os três pacotes.
