# Baseline — snapshot inicial

Commit de referência: `589e79d` — estado do projeto **antes** das correções do mastercheck.

## Bugs corrigidos (PR #2)

1. ~~Chats: `leadId` da conversa não é atualizado ao criar oportunidade~~
2. ~~Painel: gráfico "Vendas por Vendedor" ignora filtro de vendedor~~
3. ~~Propostas: numeração duplicada (`state.propostas.length` stale)~~
4. ~~Chats: contador `naoLidas` não atualiza~~
5. ~~Agenda: timezone em datas (`type="date"` + `toISOString()`)~~
6. ~~Funil: conflito clique vs arrastar nos cards~~
7. ~~E-mails: seleção desatualizada após busca~~
8. ~~Dependência `nitro` desalinhada com `@lovable.dev/vite-tanstack-config`~~

## Workflow

- `main` — baseline + releases estáveis
- Correções via branch `fix/*` ou `feat/*` → Pull Request → merge
