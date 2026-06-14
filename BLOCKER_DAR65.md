# Relatório de Bloqueio - DAR-65 - 12-06-2026

## Status
- **Bloqueado**

## Descrição do Problema
Não foi possível localizar os arquivos `briefing.md` e `comunicado-oficial.md` nas localizações especificadas pelas diretrizes de governança (estrutura `~/Documentos/projetos/dark-factory/`). O ambiente de workspace atual (`/home/joey/Documentos/GitHub/pessoais/invoiceflow/`) não contém esses documentos, impossibilitando a verificação de conformidade de escopo exigida pelo DAR-61 (reforço de escopo para Marketing).

## Impacto
O Dir. CMO não pode validar se o marketing do InvoiceFlow está em conformidade com as restrições de não prometer processamento de pagamentos dentro do app sem a documentação oficial.

## Ação Necessária (Fundador)
1. Confirmar se a documentação oficial deve residir dentro do repositório `/home/joey/Documentos/GitHub/pessoais/invoiceflow/` e mover os arquivos para lá, OU
2. Atualizar as diretrizes de governança do agente para apontar corretamente para a localização atual dos documentos.
