# Observabilidade

O checkout possui logging configurável na API, logs de requisição, logs acessíveis ao cliente e
rotinas agendadas com registro de execução. A configuração inclui nível de log, saída formatada e
retenção por severidade para logs de requisição, além de retenção de logs de cron.

O endpoint de health pertence à infraestrutura da API e é exercitado pelo smoke test. Registros de
observabilidade não devem expor senha, token, hash, segredo ou payload sensível.

Não há evidência suficiente nesta documentação para descrever métricas, tracing distribuído, alertas
ou uma plataforma externa de monitoramento. Esses assuntos permanecem pendentes.
