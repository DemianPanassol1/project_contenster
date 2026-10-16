# Visão geral da arquitetura

```text
apps/api  --->  apps/shared  <---  apps/web
                    |
          contratos e catálogo técnico
```

## Shared

`apps/shared` contém contratos públicos, tipos de domínio, utilitários independentes de framework e o catálogo técnico de funcionalidades. Não pode depender de NestJS, Next.js, React, TypeORM ou de implementações da API e do Web.

## API

`apps/api` é a autoridade para autenticação, sessão, autorização, contexto de cliente, ownership, validação HTTP, regras de negócio, transações, persistência, migrations, seeds, logs e tarefas.

## Web

`apps/web` é responsável por apresentação e interação no navegador. Ele mantém o token opaco em cookie HTTP-only e não deve expor, persistir ou confiar em credenciais no código de cliente.

Checagens de permissão no Web controlam apresentação, mas não autorizam requests. A API deve repetir a decisão por guards, contexto autenticado e regras do caso de uso.

## Regras de dependência

- API e Web podem importar contratos públicos do Shared.
- Shared não importa das aplicações.
- Web não importa serviços, entidades ou repositórios da API.
- API não importa componentes, rotas ou dependências de interface do Web.

O ESLint deve preservar essas fronteiras.
