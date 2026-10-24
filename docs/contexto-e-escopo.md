# Contexto e escopo

## Objetivo

O Contenster Slim Core fornece uma base administrativa multi-cliente para autenticação, autorização, contexto de cliente e capacidades operacionais de apoio.

O cliente é a fronteira de isolamento. Um usuário pode participar de clientes diferentes, mas tem um único perfil em cada cliente. O perfil determina as permissões disponíveis no contexto ativo.

## Capacidades previstas

- Clientes e usuários.
- Perfis, permissões, ações, módulos e funcionalidades.
- Autenticação, recuperação de senha, sessão opaca e troca de contexto.
- Idiomas, países, estados e cidades.
- Arquivos e provedores de armazenamento.
- Logs de requisição e tarefas técnicas de limpeza e agendamento.
- Administração global para superusuários.
- Portais globais de identidade, seus hosts e mídias de login.

Estar listado aqui ou possuir diretório no código não significa que o módulo já esteja implementado ou publicado. A implementação deve respeitar o estágio real do checkout.

## Fora do escopo

- Produtos e extensões por produto.
- Orquestração de sites, publicação e conteúdo.
- Interface Web consumidora da resolução pública de portais.
- Perfil virtual, sessão virtual e acesso administrativo em nome de outro cliente.
- Multi-schema e seleção de schema por contexto, request ou navegador.
- Controle manual de timezone.

## Bootstrap inicial

O bootstrap técnico cria idiomas, ações, localização, módulos, funcionalidades, um cliente inicial, um perfil inicial, o vínculo administrativo e o usuário `admin` com senha `123456`.

Essas credenciais são genéricas para instalação inicial. Devem ser alteradas antes de qualquer uso externo e nunca devem ser tratadas como segredo permanente.
