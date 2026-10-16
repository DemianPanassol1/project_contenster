# Decisões em aberto

Este documento reúne assuntos que não devem virar convenção por inferência. Ao decidir um item, atualize o documento de arquitetura ou desenvolvimento correspondente e remova-o daqui.

## Modelagem do vínculo de contexto

O banco precisa garantir que um usuário tenha no máximo um perfil por cliente. A associação simples `usuário + perfil` não assegura essa regra quando perfis diferentes pertencem ao mesmo cliente.

Definir a modelagem e a constraint física que representará `usuário + cliente` sem perder a relação com o perfil.

## Bootstrap de credenciais

O usuário inicial será `admin` com senha `123456`. Falta definir o mecanismo operacional que obriga ou controla a troca dessa senha antes de uma instalação ser exposta externamente.

## Sessão e infraestrutura

Definir variáveis de ambiente, TTL de sessão, política de lembrar acesso, estratégia de Redis no ambiente de testes e comportamento quando Redis estiver indisponível.

## Contratos HTTP e auditoria

Registrar no código e nos testes os contratos de autenticação, seleção e troca de contexto, cookies, erros e paginação antes de estabilizar consumidores externos.

Preservar logs de requisição, sanitização e eventos relevantes ao contexto persistido. Definir a lista final de eventos administrativos e o período de retenção.
