# Prompts de trabalho

Este documento reúne modelos de prompts para orientar atividades de análise, planejamento, desenvolvimento, refatoração e correção de funcionalidades.

Os prompts foram elaborados para serem utilizados tanto por desenvolvedores quanto por agentes de inteligência artificial, promovendo consistência na execução das tarefas e respeito às convenções do projeto.

São modelos de referência, não instruções rígidas. Podem ser adaptados conforme a complexidade e as necessidades de cada atividade.

As regras arquiteturais e os padrões de desenvolvimento permanecem definidos no `AGENTS.md` e na documentação técnica em `/docs`. Os prompts complementam essas referências, concentrando-se no objetivo e no escopo de cada tarefa, sem duplicar suas definições.

## Analisar uma funcionalidade

```text
Analise a funcionalidade **[nome da funcionalidade]**.

Consulte o `AGENTS.md` e a documentação aplicável em `/docs`. Investigue sua implementação atual, incluindo dependências, fluxos, regras de negócio, persistência e integrações relevantes.

Avalie:

- Funcionamento atual e responsabilidades dos componentes.
- Aderência à arquitetura e às convenções documentadas.
- Possíveis problemas, inconsistências, duplicações e oportunidades de melhoria.
- Riscos e impactos de eventuais alterações.

Apresente os resultados por relevância, distinguindo problemas comprovados de sugestões de melhoria.

**Não modifique arquivos.**
```

## Implementar uma funcionalidade

```text
Implemente a funcionalidade **[nome da funcionalidade]**.

**Requisitos:**
[Descreva o comportamento esperado, regras de negócio e critérios de aceitação.]

Antes de implementar:
- Consulte o `AGENTS.md` e a documentação aplicável em `/docs`.
- Investigue funcionalidades equivalentes e componentes reutilizáveis.
- Identifique os módulos, contratos e camadas envolvidos.
- Respeite as responsabilidades e convenções documentadas.

Implemente a solução mais simples que atenda aos requisitos, evitando abstrações e dependências desnecessárias.

Preserve os comportamentos e contratos existentes que não fazem parte da alteração.

Execute as validações pertinentes e atualize a documentação quando houver mudanças relevantes nas regras ou convenções.

Ao concluir, apresente um resumo da implementação, os arquivos modificados, as validações realizadas e eventuais pendências.
```

## Refatorar uma funcionalidade

```text
Refatore **[módulo, funcionalidade ou conjunto de arquivos]**.

Consulte o `AGENTS.md` e a documentação aplicável em `/docs`.

Analise a implementação atual e identifique oportunidades concretas de melhoria em:

- Legibilidade e organização.
- Separação de responsabilidades.
- Reutilização de código existente.
- Complexidade e duplicações.
- Aderência às convenções arquiteturais.

Realize a refatoração preservando o comportamento funcional, os contratos públicos e a compatibilidade existente.

Não introduza abstrações artificiais, novas dependências ou mudanças de comportamento não solicitadas.

Execute as validações pertinentes e informe as alterações realizadas, os benefícios obtidos e eventuais limitações de validação.
```

## Corrigir um problema

```text
Investigue e corrija o seguinte problema:

**Comportamento observado:** [descreva o problema]

**Comportamento esperado:** [descreva o resultado correto]

**Contexto adicional:** [logs, mensagens de erro, rotas ou informações relevantes]

Consulte o `AGENTS.md` e a documentação aplicável em `/docs`.

Identifique a causa raiz antes de modificar a implementação. Não aplique soluções paliativas sem compreender o problema.

Implemente uma correção localizada, preservando os demais comportamentos e contratos.

Adicione ou ajuste testes pertinentes quando houver infraestrutura de testes adequada.

Execute as validações necessárias e apresente a causa identificada, a correção aplicada, os arquivos modificados e as verificações realizadas.
```

## Planejamento de mudanças

```text
Quero implementar **[objetivo ou mudança desejada]**, mas antes precisamos definir a abordagem técnica.

Consulte o `AGENTS.md`, a documentação aplicável em `/docs` e a implementação atual.

Investigue:
- Como o sistema atende atualmente a essa necessidade.
- Quais componentes e contratos serão afetados.
- Quais alternativas de implementação são viáveis.
- Quais são os impactos, riscos e trade-offs de cada alternativa.
- Qual abordagem você recomenda e por quê.

Priorize soluções compatíveis com a arquitetura existente e evite complexidade desnecessária.

Apresente uma proposta técnica com etapas de implementação e critérios de validação.

Destaque decisões que dependam da minha aprovação.

**Não modifique arquivos nem inicie a implementação.**
```
