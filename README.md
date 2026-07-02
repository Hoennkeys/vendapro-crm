# GlowUP

**GlowUP** é um sistema operacional para criadores de conteúdo, influenciadores, streamers e agências.

Centralize toda a operação profissional de um creator em uma única plataforma — marcas, campanhas, comunicação, calendário, financeiro e muito mais.

## Posicionamento

GlowUP não é um CRM de vendas. É a **plataforma para criadores** que unifica:

- **Inbox Omnichannel** — comunicação unificada com marcas e parceiros
- **Campanhas** — gestão de parcerias e pipeline de campanhas
- **Marcas** — relacionamento com brands e agências
- **Calendário** — agenda e entregas
- **Financeiro** — faturamento e receita de parcerias
- **Contratos** — propostas de campanha e acordos
- **Arquivos** — documentos e materiais de produção
- **IA** — assistência inteligente para operação creator
- **Media Kit** — apresentação profissional para parceiros

> Migração de marca em progresso. Rotas e módulos legados (`/funil`, `/painel`, CRM Store) são preservados por compatibilidade — apenas a linguagem e identidade visual foram atualizadas nesta sprint.

## Stack

- React 19 + TypeScript
- TanStack Start / Router / Query
- Tailwind CSS 4 + shadcn/ui
- Vite 7

## Desenvolvimento local

```bash
npm install --legacy-peer-deps
npm run dev
```

Abra [http://localhost:8080](http://localhost:8080) (ou a porta indicada no terminal).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## Identidade visual

Paleta **GlowUP**: violeta/rosa creator economy, tipografia Plus Jakarta Sans, visual premium e minimal. Tokens de marca em `src/styles.css` (`--glowup-gradient`, `--glowup-accent`).

## Terminologia (UI)

| Legado | GlowUP |
|--------|--------|
| Cliente | Marca |
| Lead | Oportunidade |
| Venda | Parceria |
| Funil de vendas | Pipeline de campanhas |
| Proposta comercial | Proposta de campanha |

Camada central: `src/lib/product-branding.ts` e `src/modules/creator/domain/terminology.ts`.
