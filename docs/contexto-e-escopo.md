# Contexto e escopo

## Objetivo

O Core fornece uma base administrativa multi-cliente para autenticação, autorização, contexto de
cliente e capacidades operacionais de apoio.

O cliente é a fronteira de isolamento. Um usuário pode participar de clientes diferentes, mas tem um único perfil em cada cliente. O perfil determina as permissões disponíveis no contexto ativo.

## Capacidades do checkout

- Clientes e usuários.
- Perfis, permissões, ações, módulos e funcionalidades.
- Autenticação, recuperação de senha, sessão opaca e troca de contexto.
- Idiomas, países, estados e cidades.
- Arquivos e provedores de armazenamento.
- Logs de requisição e tarefas técnicas de limpeza e agendamento.
- Administração global para superusuários.
- Portais globais de identidade, seus hosts e mídias de login.

Esta lista descreve capacidades encontradas no código e na documentação do checkout. A publicação em
um ambiente específico continua dependendo de sua configuração e implantação.

## Fora do escopo

- Produtos e extensões por produto.
- Orquestração de sites, publicação e conteúdo.
- Interface Web consumidora da resolução pública de portais.
- Perfil virtual, sessão virtual e acesso administrativo em nome de outro cliente.
- Multi-schema e seleção de schema por contexto, request ou navegador.
- Controle manual de timezone por usuário, cliente ou sessão. O ambiente define um único fuso
  operacional fixo, usado para persistência e apresentação de datas.

## Reutilização por template

O Core é reutilizado por cópia em um novo repositório. A aplicação derivada passa a ter código,
infraestrutura e ciclo de evolução próprios, podendo adaptar esta base ao seu domínio. Não existe
distribuição por pacote, plugin, submódulo ou sincronização automática com este repositório.

## Bootstrap inicial

O bootstrap técnico cria idiomas e ações globais, localização, módulos, funcionalidades de cliente,
um cliente inicial, um perfil inicial, o vínculo administrativo e o usuário `admin` com senha
`123456`. Idiomas e ações não são funcionalidades atribuídas ao cliente inicial.

Essas credenciais são genéricas para instalação inicial. Devem ser alteradas antes de qualquer uso externo e nunca devem ser tratadas como segredo permanente.
