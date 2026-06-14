# InvoiceFlow — Script de Follow-up Automático de Leads

**Versão:** 1.0  
**Data:** Junho 2026  
**Canal:** E-mail + WhatsApp

---

## 1. Visão Geral da Sequência

A sequência de follow-up cobre dois cenários:

- **A) Trial ativo (usuário cadastrado, não pagante)**
- **B) Lead frio (preencheu formulário, não cadastrou ainda)**

---

## 2. Sequência A — Trial Ativo (14 dias)

> Acionada automaticamente quando o usuário se cadastra e inicia o trial Pro.

### E-mail A1 — Boas-vindas (Dia 0 — imediato)

**Assunto:** Bem-vindo ao InvoiceFlow — seu trial Pro está ativo 🎉

```
Olá, [NOME]!

Seu trial gratuito de 14 dias no plano Pro está ativo.

Aqui está o que você pode fazer agora:
→ Criar sua primeira fatura em menos de 2 minutos
→ Personalizar seu template com logo e cores da sua marca
→ Ativar lembretes automáticos de pagamento

[BOTÃO: Criar minha primeira fatura]

Qualquer dúvida, estou aqui.

— Time InvoiceFlow
```

---

### E-mail A2 — Ativação (Dia 1)

**Assunto:** Uma pergunta rápida, [NOME]

```
Oi, [NOME]!

Você se cadastrou ontem e quero ter certeza de que está aproveitando ao máximo.

Você já criou sua primeira fatura?

Se não, levou menos de 2 minutos para mim quando testei — sério.

[BOTÃO: Criar fatura agora]

Se tiver qualquer problema, pode responder este e-mail.

— [NOME DO CSM], InvoiceFlow
```

---

### E-mail A3 — Valor (Dia 3)

**Assunto:** Como [NOME DE CLIENTE FICTÍCIO] economizou 4h/semana com InvoiceFlow

```
Oi, [NOME]!

A Mariana é designer freelancer. Antes do InvoiceFlow, ela gastava ~4 horas por semana
gerenciando planilhas, lembretes de pagamento e cobranças manuais.

Hoje, ela configurou um lembrete automático para 3, 7 e 14 dias após o vencimento.
Resultado: 90% dos clientes pagam antes do primeiro lembrete chegar.

Você já configurou os seus?

[BOTÃO: Configurar lembretes agora]

— Time InvoiceFlow
```

---

### E-mail A4 — Urgência leve (Dia 7 — metade do trial)

**Assunto:** 7 dias restantes no seu trial Pro, [NOME]

```
Oi, [NOME]!

Você está na metade do seu trial Pro. Tem 7 dias restantes.

Até agora você [criou X faturas / ainda não criou nenhuma fatura] — 
*[personalizar via merge tag com dado real do usuário]*

Se quiser continuar com todas as funcionalidades Pro após o dia [DATA], 
o plano é R$ 47/mês — menos que uma hora do seu tempo.

[BOTÃO: Assinar Pro agora por R$ 47/mês]

Prefere falar antes? Me responde aqui.

— Time InvoiceFlow
```

---

### E-mail A5 — Feature highlight (Dia 11)

**Assunto:** Você sabia que pode receber em 1 dia útil com InvoiceFlow?

```
Oi, [NOME]!

Integração nativa com Asaas: seus clientes pagam por PIX, boleto ou cartão,
e o dinheiro cai na sua conta em até 1 dia útil.

Sem precisar ficar checando comprovantes ou mandando link de pagamento manual.

Configure agora e já use na sua próxima fatura:
[BOTÃO: Conectar Asaas]

— Time InvoiceFlow
```

---

### E-mail A6 — Último aviso (Dia 13 — 1 dia antes do fim)

**Assunto:** Amanhã seu trial Pro expira — o que acontece depois?

```
Oi, [NOME]!

Seu trial Pro vence amanhã.

Depois disso, sua conta muda para o plano Free:
- Limite de 3 faturas/mês
- Sem lembretes automáticos
- Sem templates personalizados

Para manter tudo funcionando como está, assine o Pro hoje:

[BOTÃO: Manter meu Pro — R$ 47/mês]

Ou, se quiser falar comigo antes de decidir, responda este e-mail.

— Time InvoiceFlow
```

---

### E-mail A7 — Downgrade confirmado (Dia 14 — se não assinar)

**Assunto:** Seu trial encerrou — você ainda tem acesso Free

```
Oi, [NOME]!

Seu trial Pro encerrou. Você agora está no plano Free (3 faturas/mês).

Quando quiser voltar ao Pro, é só um clique:
[BOTÃO: Assinar Pro — R$ 47/mês]

Guardamos tudo: suas faturas, clientes e templates continuam salvos.

— Time InvoiceFlow
```

---

## 3. Sequência B — Lead Frio (Não cadastrou)

> Acionada para leads que deixaram e-mail no formulário de waitlist ou landing page mas não completaram o cadastro.

### E-mail B1 — Convite (Dia 0 — imediato após lead)

**Assunto:** Seu acesso ao InvoiceFlow está esperando, [NOME]

```
Oi, [NOME]!

Você deixou seu e-mail no InvoiceFlow — ótima escolha.

Criamos uma conta para você. Para ativar, é só clicar abaixo:

[BOTÃO: Ativar minha conta grátis]

Leva menos de 1 minuto. Sem cartão de crédito.

— Time InvoiceFlow
```

---

### E-mail B2 — Follow-up simples (Dia 2)

**Assunto:** Ainda está pensando, [NOME]?

```
Oi, [NOME]!

Notei que você ainda não ativou sua conta.

Entendo — às vezes a lista de tarefas cresce demais.

Se tiver 2 minutos agora:
[BOTÃO: Começar grátis]

Se tiver alguma dúvida antes, me responde aqui mesmo.

— [NOME], InvoiceFlow
```

---

### E-mail B3 — Prova social (Dia 5)

**Assunto:** Como freelancers estão usando o InvoiceFlow

```
Oi, [NOME]!

"Antes eu perdia horas toda semana fazendo cobranças manualmente. 
Agora o InvoiceFlow faz isso por mim — e minha taxa de inadimplência caiu 40%."
— Rodrigo M., designer freelancer

Quer o mesmo resultado?

[BOTÃO: Experimentar grátis por 14 dias]

— Time InvoiceFlow
```

---

### E-mail B4 — Última tentativa (Dia 14)

**Assunto:** Última mensagem nossa, [NOME]

```
Oi, [NOME]!

Esta é a última mensagem que vou te enviar sobre o InvoiceFlow.

Se não é o momento certo para você, tudo bem. 
Seu e-mail sairá da nossa lista de contato.

Mas se quiser testar antes de ir:
[BOTÃO: Acessar InvoiceFlow grátis]

Qualquer coisa, pode me responder aqui.

— [NOME], InvoiceFlow
```

---

## 4. Sequência C — WhatsApp (Leads quentes / enterprise)

> Usar somente para leads com intenção clara de plano Business ou gerados via indicação direta.

### Mensagem C1 — Primeiro contato (até 1h após o lead)

```
Oi, [NOME]! Tudo bem?

Sou [SEU NOME] do InvoiceFlow. Vi que você se interessou pela plataforma.

Posso te mostrar em 15 minutos como funciona na prática para o seu caso?

Se quiser, me fala um horário que fica bom para você essa semana. 🙂
```

---

### Mensagem C2 — Follow-up (Dia 2 se sem resposta)

```
Oi, [NOME]! Passando para ver se você chegou a ver minha mensagem.

Se preferir, pode me responder quando for mais conveniente.

Qualquer dúvida sobre o InvoiceFlow também pode perguntar aqui mesmo!
```

---

### Mensagem C3 — Proposta enviada

```
Oi, [NOME]! Acabei de te enviar a proposta por e-mail.

Dá uma olhada quando puder — está bem detalhada mas é bem direta.

Se quiser discutir algum ponto, é só falar! 😊
```

---

### Mensagem C4 — Follow-up pós-proposta (3 dias)

```
Oi, [NOME]! 

Você chegou a ver a proposta?

Se tiver qualquer dúvida ou quiser ajustar algum detalhe, fico à disposição.

A proposta está válida até [DATA].
```

---

## 5. Regras de Operação

| Regra                             | Detalhe                                              |
|-----------------------------------|------------------------------------------------------|
| Horário de envio (e-mail)         | Dias úteis, 9h–11h ou 14h–16h (horário Brasília)     |
| Horário de envio (WhatsApp)       | Dias úteis, 9h–18h apenas                           |
| Intervalo mínimo entre mensagens  | 24h                                                  |
| Descadastramento                  | Todo e-mail deve ter link de unsubscribe             |
| LGPD                              | Somente contatar leads com consentimento expresso    |
| Blacklist                         | Nunca reenviar para quem pediu exclusão              |
| Personalização obrigatória        | Sempre usar [NOME] — nunca "Olá" sem nome            |

---

## 6. Ferramentas Recomendadas

| Função                  | Ferramenta sugerida             |
|-------------------------|----------------------------------|
| Automação de e-mail     | Loops.so / Resend / Mailerlite  |
| CRM de leads            | Notion + automação / Pipedrive  |
| WhatsApp Business       | WhatsApp Business API           |
| Analytics de abertura   | UTM tags + PostHog              |
| A/B test de subject     | Mailerlite ou Loops.so          |

---

*Documento interno — InvoiceFlow | Revisão trimestral*
