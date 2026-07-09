# Gitflow Compliance — InvoiceFlow

**Última atualização:** 08-07-2026
**Responsável:** Dir. CTO
**Aprovado por:** VP Executivo

---

## 1. Estrutura de Branches (Obrigatória)

| Branch                | Origem    | Destino              | Quem pode commitar         | Protegida |
| --------------------- | --------- | -------------------- | -------------------------- | --------- |
| `main`                | —         | —                    | Apenas via PR + 2 humanos  | Sim       |
| `develop`             | `main`    | `main` (via release) | Apenas via PR              | Sim       |
| `feature/DAR-XX-desc` | `develop` | `develop`            | Qualquer agente técnico    | Não       |
| `fix/DAR-XX-desc`     | `develop` | `develop`            | Qualquer agente técnico    | Não       |
| `hotfix/DAR-XX-desc`  | `main`    | `main` + `develop`   | Qualquer agente técnico    | Não       |
| `release/vX.Y.Z`      | `develop` | `main`               | Ger. Engenharia / Dir. CTO | Não       |
| `chore/DAR-XX-desc`   | `develop` | `develop`            | Qualquer agente técnico    | Não       |

**Regra inviolável:** Nenhum commit direto em `main` ou `develop`. Todo código entra via Pull Request.

---

## 2. Nomenclatura de Branches

```
<tipo>/<issue-id>-<descricao-curta>

Exemplos:
  feature/DAR-287-gitflow-compliance
  fix/DAR-290-corrigir-login
  hotfix/DAR-291-crash-pdf
  chore/DAR-292-atualizar-deps
  release/v1.2.0
```

**Regras:**

- Tipos permitidos: `feature`, `fix`, `hotfix`, `release`, `chore`
- Issue ID obrigatório quando houver (DAR-XXX, APPA-XXX)
- Descrição em kebab-case, no máximo 50 caracteres
- Sem caracteres especiais além de `-` e `/`

---

## 3. Fluxo Obrigatório de Desenvolvimento

### 3.1 Antes de começar

```bash
git checkout develop
git pull origin develop
```

### 3.2 Criar branch de feature

```bash
git checkout -b feature/DAR-XXX-descricao-curta
```

### 3.3 Commits atômicos

```bash
git add -A
git commit -m "tipo(escopo): mensagem no imperativo"
git push -u origin feature/DAR-XXX-descricao-curta
```

### 3.4 Abrir Pull Request

```bash
gh pr create --base develop \
  --title "tipo: descrição" \
  --body "Closes DAR-XXX"
```

### 3.5 Merge

- PR aprovado → squash merge em `develop`
- Release → PR `release/vX.Y.Z` → `main` com 2 aprovações humanas

---

## 4. Conventional Commits (Obrigatório)

| Tipo       | Uso                                            |
| ---------- | ---------------------------------------------- |
| `feat`     | Nova funcionalidade                            |
| `fix`      | Correção de bug                                |
| `docs`     | Documentação                                   |
| `style`    | Formatação, espaços, lint (sem mudança lógica) |
| `refactor` | Refatoração sem mudança de comportamento       |
| `test`     | Testes unitários/integração                    |
| `chore`    | Manutenção, deps, CI/CD                        |
| `ci`       | Mudanças em CI/CD                              |
| `perf`     | Melhoria de performance                        |

Formato: `tipo(escopo): mensagem no imperativo`

**Exemplos:**

```
feat(api): adicionar endpoint de exportação de faturas
fix(auth): corrigir timeout de sessão expirada
ci(gitflow): adicionar validação de nomenclatura de branches
```

---

## 5. Validações Automáticas (CI/CD)

O pipeline de CI executa as seguintes verificações em TODO push e PR:

### 5.1 Validação de branch (gitflow-check)

- Push direto em `main` ou `develop` é bloqueado
- Nome da branch deve seguir o padrão `<tipo>/<descricao>`
- Tipo deve ser um dos permitidos

### 5.2 Validação de PR

- Título do PR deve seguir conventional commits
- Descrição deve conter link para a issue do Paperclip
- Build e lint devem passar

---

## 6. Pull Requests

### 6.1 Checklist obrigatório antes de abrir PR

- [ ] Branch criada a partir de `develop`
- [ ] Nome da branch segue o padrão
- [ ] Commits são atômicos com mensagens no formato correto
- [ ] `git pull origin develop` + rebase feito
- [ ] Build passa localmente (`npm run build`)
- [ ] Lint passa (`npx next lint`)
- [ ] Nenhum secret commitado
- [ ] Descrição do PR explica o que foi feito e por quê
- [ ] Issue do Paperclip linkada no PR

### 6.2 Tamanho máximo

- 400 linhas por PR. Acima disso, dividir em múltiplos PRs.

---

## 7. Consequências de Violação

| Violação                                 | Ação                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| Commit direto em `main`/`develop`        | Reverter commit + notificação ao Dir. CTO + VP Executivo       |
| Branch com nome incorreto                | Renomear branch + corrigir no próximo commit                   |
| Commit sem conventional commit           | Squad leader orienta o autor. Reincidência → notificação ao VP |
| PR sem descrição ou link da issue        | Bloqueado até correção                                         |
| PR > 400 linhas sem aprovação do gerente | Bloqueado até divisão                                          |

---

## 8. Exceções

- **Hotfix urgente:** Pode pular o fluxo de feature branch, mas ainda requer:
  - Branch `hotfix/DAR-XXX-desc` a partir de `main`
  - PR revisado por pelo menos 1 humano
  - Merge também em `develop` após resolução
- **Documentação simples:** Pode ser feita diretamente em `chore/DAR-XXX-docs` sem necessidade de approval de review

---

## 9. Referências

- [Dark Factory Gitflow Skill](../../skills/df-gitflow.md)
- [Documentação de Arquitetura](architecture.md)
- [Briefing do Produto](briefing.txt)
- [Issue DAR-279](/DAR/issues/DAR-279) — Plano de Correção de Gitflow
