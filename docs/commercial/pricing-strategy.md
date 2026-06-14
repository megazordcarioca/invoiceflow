# InvoiceFlow — Estratégia de Precificação

**Versão:** 1.0  
**Data:** Junho 2026  
**Responsável:** CMO

---

## 1. Visão Geral

O InvoiceFlow opera com um modelo **Freemium + SaaS mensal**, com três faixas de preço desenhadas para capturar freelancers individuais até pequenas empresas com equipes.

### Conversão de preços (USD → BRL)

| Plano    | USD/mês | BRL/mês | BRL/ano (–20%) |
|----------|---------|---------|-----------------|
| Free     | $0      | R$ 0    | R$ 0            |
| Pro      | $9      | R$ 47   | R$ 451          |
| Business | $19     | R$ 97   | R$ 931          |

> Câmbio de referência: 1 USD = R$ 5,22. Atualizar trimestralmente.

---

## 2. Definição dos Planos

### 2.1 Plano Free — R$ 0/mês

**Objetivo:** Aquisição e geração de topo de funil. Reduzir fricção de cadastro.

| Limite/Feature          | Free         |
|-------------------------|--------------|
| Faturas por mês         | 3            |
| Exportação PDF          | ✅           |
| Dashboard básico        | ✅           |
| Templates personalizados| ❌           |
| Lembretes automáticos   | ❌           |
| Suporte                 | Comunidade   |
| Membros do time         | 1            |
| API access              | ❌           |

**Público-alvo:** Freelancers iniciantes testando a plataforma.  
**Gate de conversão:** Ao atingir 3 faturas/mês, exibir upsell para Pro.

---

### 2.2 Plano Pro — R$ 47/mês ($9 USD)

**Objetivo:** Monetização de freelancers ativos e solopreneurs.

| Limite/Feature          | Pro            |
|-------------------------|----------------|
| Faturas por mês         | Ilimitadas     |
| Exportação PDF          | ✅             |
| Templates personalizados| ✅             |
| Lembretes automáticos   | ✅             |
| Dashboard avançado      | ✅             |
| Suporte                 | E-mail (4h)    |
| Membros do time         | 1              |
| API access              | ❌             |
| Analytics avançado      | ❌             |

**Público-alvo:** Freelancers que faturam mais de R$ 3.000/mês.  
**Proposta de valor:** "Pague R$ 47 e economize horas de trabalho manual todo mês."  
**ROI comunicado:** Um único pagamento recuperado via lembrete automático já paga o plano.

---

### 2.3 Plano Business — R$ 97/mês ($19 USD)

**Objetivo:** Monetização de PMEs, agências e squads financeiros.

| Limite/Feature          | Business       |
|-------------------------|----------------|
| Faturas por mês         | Ilimitadas     |
| Exportação PDF          | ✅             |
| Templates personalizados| ✅             |
| Lembretes automáticos   | ✅             |
| Dashboard avançado      | ✅             |
| Suporte                 | Chat + e-mail (1h)|
| Membros do time         | Até 5          |
| API access              | ✅             |
| Analytics avançado      | ✅             |
| Integração contábil     | Em roadmap     |

**Público-alvo:** Pequenas empresas com equipe financeira, agências digitais, consultorias.  
**Proposta de valor:** "Toda a sua equipe financeira em uma só plataforma por menos de R$ 100/mês."

---

## 3. Estratégia de Pricing

### 3.1 Âncora de preço
- O Plano Business funciona como âncora: torna o Pro parecer um excelente custo-benefício.
- Posicionar Pro como **"Mais Popular"** na página de preços.

### 3.2 Desconto anual
- **20% de desconto** no plano anual (equivale a ~2,4 meses grátis).
- Comunicar como "2 meses grátis" na interface — mais emocional que "20% off".

### 3.3 Desconto de lançamento (primeiros 90 dias)
- Oferecer **30% off** para os primeiros 200 assinantes Pro.
- Código: `LAUNCH30`
- Criar senso de urgência: "Vagas limitadas para fundadores iniciais."

### 3.4 Trial de 14 dias
- Todo novo cadastro tem acesso gratuito ao plano Pro por 14 dias.
- Sem necessidade de cartão de crédito para o trial.
- Sequência de e-mails de ativação nos dias 1, 3, 7, 11 e 14.

---

## 4. Comparativo Competitivo

| Plataforma      | Plano básico pago | Faturas ilimitadas? | Time? |
|-----------------|-------------------|---------------------|-------|
| **InvoiceFlow** | R$ 47/mês         | ✅ (Pro)            | ✅ (Business) |
| Nibo             | R$ 89/mês         | ✅                  | ✅    |
| Conta Azul       | R$ 149/mês        | ✅                  | ✅    |
| FreshBooks (USD) | $19/mês           | ✅                  | ✅    |
| Invoice Ninja    | $10/mês           | ✅                  | ✅    |

**Posicionamento:** InvoiceFlow é a opção mais acessível para freelancers brasileiros, com UX moderna e integração nativa com Asaas (pagamentos locais).

---

## 5. Métricas-Chave de Pricing

| Métrica                  | Meta Mês 3 | Meta Mês 6 | Meta Mês 12 |
|--------------------------|------------|------------|-------------|
| Free → Pro conversion    | 8%         | 12%        | 15%         |
| Pro → Business upsell    | 10%        | 15%        | 20%         |
| Churn mensal (Pro)       | < 5%       | < 4%       | < 3%        |
| MRR                      | R$ 2.000   | R$ 8.000   | R$ 25.000   |
| ARPU                     | R$ 55      | R$ 60      | R$ 68       |

---

## 6. Gatilhos de Upsell In-App

| Momento               | Ação de Upsell                                      |
|-----------------------|-----------------------------------------------------|
| 2ª fatura criada (Free)| Banner "Você está quase no limite — upgrade para Pro"|
| 3ª fatura (Free)      | Modal bloqueante com call-to-action para Pro        |
| 30 dias no Pro        | E-mail "Descubra o plano Business" com case de uso  |
| Tentativa de add team member | Upsell direto para Business               |
| Tentativa de API access | Upsell direto para Business                       |

---

*Documento interno — InvoiceFlow | Atualizar a cada trimestre*
