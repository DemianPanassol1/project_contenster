# Identidade, RBAC e contexto

## Modelo de acesso

```text
Usuário -> Perfil -> Cliente
                 -> Permissões por funcionalidade e ação
```

O perfil pertence a um cliente. Um usuário pode ter vínculos com vários clientes, mas não pode ter dois perfis no mesmo cliente. Essa regra deve ser garantida pela persistência, não apenas por validação de serviço.

## Autenticação e sessão

1. A API valida usuário e senha sem revelar qual credencial falhou.
2. A API retorna os clientes ativos para os quais o usuário possui vínculo elegível.
3. O usuário escolhe um cliente e a API resolve o único perfil correspondente.
4. A API monta a árvore de funcionalidades e permissões para o contexto.
5. Um token opaco é entregue ao Web e armazenado em cookie HTTP-only.
6. O estado da sessão fica no Redis; PostgreSQL continua autoritativo.

O estado persistido no Redis inclui contexto, autorização calculada e informações de revogação e expiração. Uma reinicialização do Redis invalida sessões e exige nova autenticação.

A API sincroniza sessões persistidas no Redis após operações críticas. No Web administrativo, um
revalidador central consulta `GET /auth/session` após mutações bem-sucedidas, ao voltar à aba,
receber foco, recuperar conectividade e após um minuto sem interação. Ele atualiza a página apenas
quando a sessão recebida diverge da sessão que renderizou o layout. Não existe uma rota pública de
"sincronização de sessão": a manutenção do Redis é uma responsabilidade interna da API.

## Senhas e recuperação de acesso

- A alteração de senha pelo usuário autenticado exige a senha atual. Ao concluir, as demais sessões
  opacas daquele usuário são revogadas; a sessão que originou a requisição permanece válida no
  contexto atual.
- A recuperação de senha começa por uma rota pública que sempre devolve a mesma resposta para e-mail
  encontrado ou inexistente. Isso impede enumeração de contas.
- O link de recuperação contém um JWT exclusivo para essa finalidade e possui expiração curta. O seu
  identificador aleatório é armazenado no Redis de forma hashada e consumido atomicamente; portanto,
  o link só pode redefinir a senha uma vez.
- A redefinição exige usuário ativo e não bloqueado, troca o hash da senha e revoga todas as sessões
  opacas do usuário.
- As configurações de e-mail e da chave de assinatura são obrigatórias para expor a recuperação.
  Nenhuma credencial de SMTP é persistida no banco.

## Troca de contexto e isolamento

A troca de contexto ocorre por rota autenticada. Ela valida novamente usuário, cliente, perfil e vínculo persistido, rotaciona a sessão conforme a política definida e emite novo token opaco.

O contexto global é reservado a usuários com a flag persistida de superusuário. Ele permite operar
capacidades administrativas globais, mas não equivale a um perfil de cliente nem pode ser usado para
acessar dados de cliente sem um vínculo persistido. Em requests protegidos, a API deve revalidar
usuário, cliente, perfil e vínculo. Uma sessão em cache não pode manter autorizado um usuário
bloqueado, um cliente inativo ou um perfil desativado.

Toda consulta ou escrita pertencente a cliente deve usar o `clientId` confiável do contexto autenticado. Um identificador recebido no corpo, query, rota ou header não comprova acesso.

Na configuração do próprio cliente, o estado de ativação não pode ser alterado. Desativar um
cliente pertence ao contexto global, pois invalida as sessões e o acesso de todos os seus vínculos.
Todo cliente deve manter ao menos um idioma habilitado, já que os idiomas compõem a sessão e a
apresentação administrativa do contexto.

## Autorização

RBAC é deny-by-default. Guards e serviços exigem funcionalidade e ação adequadas; regras de ownership continuam no caso de uso específico. O slug isolado não deve ser tratado como identidade suficiente fora do limite definido pelo catálogo.
