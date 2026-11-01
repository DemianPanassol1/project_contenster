# Ambientes

O projeto usa arquivos locais de ambiente por aplicação: `apps/api/.env` e `apps/web/.env`. Os
arquivos `.env.example` são a referência versionada de nomes e valores de desenvolvimento; não
registre segredos reais na documentação ou no repositório.

## API

A API lê `.env.test` quando `NODE_ENV=test`; nos demais casos, lê `.env`. A configuração cobre,
entre outros grupos, aplicação e CORS, PostgreSQL, Redis, sessão, recuperação de senha, e-mail,
Swagger, logs, uploads, armazenamento e tarefas de limpeza.

PostgreSQL e Redis são dependências necessárias para fluxos de persistência e sessão. A API valida
formatos e requisitos de segredos críticos, com exigências adicionais em produção.

## Web

O Web possui variáveis para URL e timeout da API, nome do cookie de sessão, ambiente, versão e fuso
de apresentação. A configuração efetiva deve corresponder à URL e à política de cookies usadas pela
API no ambiente.

Antes de alterar uma variável, confirme seu consumidor no código e atualize o exemplo apenas quando
o contrato de configuração também mudar.
