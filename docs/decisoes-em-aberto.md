# Decisões em aberto

Este documento reúne assuntos que não devem virar convenção por inferência. Ao decidir um item, atualize o documento de arquitetura ou desenvolvimento correspondente e remova-o daqui.

## Bootstrap de credenciais

O usuário inicial será `admin` com senha `123456`. Falta definir o mecanismo operacional que obriga ou controla a troca dessa senha antes de uma instalação ser exposta externamente.

## Auditoria

Preservar logs de requisição, sanitização e eventos relevantes ao contexto persistido. Definir a lista final de eventos administrativos e o período de retenção.
