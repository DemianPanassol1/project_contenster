# Validação

Execute comandos na raiz do repositório, salvo quando um script documentar o contrário.

## Base

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter api test:smoke
pnpm build
git diff --check
```

Para mudanças concentradas, valide primeiro o package afetado:

```bash
pnpm --filter @contenster/shared build
pnpm --filter api build
pnpm --filter web build
```

Testes de integração e e2e completos podem exigir PostgreSQL, Redis, migrations e fixtures. Se um pré-requisito não estiver disponível, informe a limitação; não substitua a evidência por teste mais fraco.

Formatação, lint, tipagem, testes, build, browser, CI e produção provam coisas diferentes. Sucesso em uma categoria não prova automaticamente as demais.
