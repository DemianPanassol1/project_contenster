# Segurança operacional

Segredos e credenciais pertencem ao ambiente, não ao código, aos exemplos versionados ou à
documentação. Isso inclui credenciais de banco, Redis, SMTP, chaves de sessão, chaves de recuperação
de senha e credenciais de provedores de armazenamento.

Em produção, a API exige segredos válidos para sessão e recuperação e exige chave de criptografia
para credenciais de armazenamento. As credenciais iniciais de bootstrap são genéricas e devem ser
trocadas antes de expor a instalação.

Permissões do banco, Redis, infraestrutura e provedor de armazenamento devem ser concedidas no
menor escopo necessário. Procedimentos específicos de rotação, cofre de segredos e resposta a
incidentes ainda não estão documentados no checkout.
