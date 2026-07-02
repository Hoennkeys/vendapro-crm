# Creator Domain Migration — Relatório de Mapeamento

> Sprint: **Creator Domain Migration (fase 1 — aliases + UI)**  
> Regra: **nenhum código legado removido**; rotas, tipos, enums e campos persistidos intactos.

## 1. Mapeamento de conceitos

| Legado | Creator OS | Camada de alias |
|--------|------------|-----------------|
| Admin | Creator Owner | `labelCrmPapel("Administrador")`, `labelCommunicationsRole("admin")` |
| Funcionário / Vendedor | Team Member | `labelCrmPapel("Vendedor")`, `labelCommunicationsRole("employee")` |
| Cliente | Brand | `CREATOR_TERMS.client`, `clientDisplayName()` (dados inalterados) |
| Lead | Partnership Opportunity | `CREATOR_TERMS.lead`, type alias `PartnershipOpportunity = Lead` |
| Venda | Campaign Revenue | `CREATOR_TERMS.sale`, `NAV_LABELS.revenueDashboard` |
| Funil | Campaign Pipeline | `CREATOR_TERMS.funnel`, `labelPipelineDisplay()` |
| Portal | Brand Portal | `CREATOR_TERMS.portal`, `portalPageTitle()` |

**Fonte única de labels:** `src/modules/creator/domain/terminology.ts`

---

## 2. Matriz de ocorrências por conceito

Classificação: **UI** | **Nav** | **Modelo** | **Permissões** | **Rotas** | **Crítico**

### Cliente → Brand

| Área | Arquivos principais | Classificação |
|------|---------------------|---------------|
| Registry | `lib/clients-registry.ts`, `lib/types.ts` (`clientId`) | Modelo, Crítico |
| CRM store / mock | `lib/crm-store.tsx`, `lib/mock-data.ts` | Modelo, Crítico |
| Portal selectors | `lib/client-portal/*` | Modelo + Permissões, Crítico |
| Comms resolver | `lib/comunicacao/conversa-resolver.ts` | Modelo + Crítico |
| UI app | `chamados.tsx`, `faturamento.tsx`, `funil/$pipelineId.tsx` | UI ✅ relabelada |
| Portal UI | `layouts/portal-layout.tsx`, `portal/index.tsx` | UI ✅ relabelada |
| Auth | `lib/auth/types.ts` (`CLIENT` role) | Permissões, Crítico |

**Ocorrências estimadas em `src/`:** ~170 referências a `cliente`/`clientId`/`Cliente`.

### Funcionário / Vendedor → Team Member

| Área | Arquivos | Classificação |
|------|----------|---------------|
| CRM Papel | `lib/types.ts` (`Vendedor`), `crm-store.tsx` (`filtroVendedor`, `nomeVendedor`) | Modelo, Crítico |
| UI | `painel.tsx`, `funil/$pipelineId.tsx`, `configuracoes.tsx` | UI ✅ relabelada |
| Comms | `communications/domain/permissions.ts` (`employee`) | Permissões |

### Admin → Creator Owner

| Camada | Detalhe | Classificação |
|--------|---------|---------------|
| Auth platform | `ADMIN` em `lib/auth/types.ts` | Permissões, Crítico |
| CRM Papel | `Administrador` em `lib/types.ts` | Modelo + Permissões |
| Comms | `ParticipantRole: admin` | Permissões |
| UI | `configuracoes.tsx`, `role-badge.tsx` | UI ✅ relabelada |

### Portal → Brand Portal

| Área | Detalhe | Classificação |
|------|---------|---------------|
| Rotas | `/t/$tenantSlug/portal/*` (9 arquivos) | Rotas, Crítico |
| Guards | `requireClientPortalAccess` | Permissões |
| UI | `portal-layout.tsx`, títulos `head()` | UI ✅ relabelada |
| Nav portal | `components/portal/portal-nav.tsx` | Nav (labels internos mantidos) |

### Venda → Campaign Revenue

| Área | Detalhe | Classificação |
|------|---------|---------------|
| Pipeline default | `pipeline-vendas`, nome `"Vendas"` em `defaults.ts` | Modelo (dados legados) |
| UI painel | KPIs, gráficos | UI ✅ relabelada |
| Sidebar | seção `Campaign Revenue` | Nav ✅ relabelada |

### Lead → Partnership Opportunity

| Área | Detalhe | Classificação |
|------|---------|---------------|
| Tipo | `Lead` em `lib/types.ts`, `db/types.ts` | Modelo, Crítico |
| Store | `leads`, `adicionarLead`, `moverLead` | Modelo, Crítico |
| Pipeline adapter | `leadsToPipelineItems` | Crítico |
| UI funil | dialogs, botões | UI ✅ relabelada |

### Funil → Campaign Pipeline

| Área | Detalhe | Classificação |
|------|---------|---------------|
| Rotas | `/funil`, `/t/.../app/funil/$pipelineId` | Rotas, Crítico |
| Nav | `commercialNav` → Campaign Pipeline | Nav ✅ relabelada |
| Defaults | `SALES_PIPELINE_ID`, descrição legada | Modelo |
| UI | `funil/$pipelineId.tsx`, breadcrumbs | UI ✅ relabelada |

---

## 3. Arquivos impactados nesta sprint

### Novos
- `src/modules/creator/domain/terminology.ts` — camada Creator + aliases
- `src/modules/creator/domain/terminology.test.ts`
- `src/components/app-breadcrumbs.tsx`

### UI / Nav atualizados (labels only)
- `src/layouts/app-layout.tsx` — breadcrumbs no header
- `src/layouts/portal-layout.tsx`
- `src/lib/navigation/app-nav.ts` + `app-nav.test.ts`
- `src/routes/t/$tenantSlug/app/painel.tsx`
- `src/routes/t/$tenantSlug/app/funil/$pipelineId.tsx`
- `src/routes/t/$tenantSlug/app/chamados.tsx`
- `src/routes/t/$tenantSlug/app/faturamento.tsx`
- `src/routes/t/$tenantSlug/app/configuracoes.tsx`
- `src/routes/t/$tenantSlug/portal/*.tsx` (5 rotas)
- `src/modules/communications/components/shared/role-badge.tsx`
- `src/modules/creator/index.ts` — export terminology
- `e2e/chamados-chat.spec.ts` — "Atender Brand"

### Intocados (propositalmente)
- `lib/crm-store.tsx`, `lib/types.ts`, `lib/db/*`
- Rotas `/funil`, `/portal`, enums `Papel`, `Lead`, `clientId`
- Redirects legados (`/comunicacao`, `/chats`, `/emails`)

---

## 4. Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Renomear `clientId`, `Lead`, rotas `/funil` | **Alta** — breaking | Fase 2+; manter aliases até migração de persistência |
| 4 vocabulários de “Admin” (platform / tenant / Papel / comms) | Média | Labels contextuais via `terminology.ts`; documentar |
| E2E desatualizados (`sales-focus.spec.ts`) | Média | Atualizar na fase 2 ou marcar skip até reforma completa |
| Breadcrumbs com IDs opacos (`pipeline-vendas`) | Baixa | `resolveAppBreadcrumbs` mapeia IDs conhecidos |
| Mock data ainda usa nomes “João Cliente” | Baixa | Dados demo; UI já usa Brand nos rótulos |

---

## 5. Plano de migração (fases)

### Fase 1 — Concluída ✅
- Mapeamento completo
- `terminology.ts` + testes
- Labels UI: sidebar, dashboard, breadcrumbs, títulos, portal, funil, chamados
- Aliases de tipo documentados (`PartnershipOpportunity`, `BrandAccount`)

### Fase 2 — Domínio dual-write (próxima)
- Repositórios Creator leem/escrevem `Lead` via adapter
- `creator-store` como façade sobre `crm-store` para brands/opportunities
- Feature flag `VITE_CREATOR_DOMAIN_READ`

### Fase 3 — Rotas paralelas
- `/creator/opportunities` espelhando `/funil/pipeline-vendas` (redirect 302)
- `/brand-portal` alias de `/portal` (sem remover legado)

### Fase 4 — Persistência
- Colunas/tabelas `brands`, `partnership_opportunities`
- Migração SQLite + backfill de `clientId` → `brandId`

### Fase 5 — Remoção legado
- Deprecar tipos `Lead`, rotas `/funil`, labels CRM
- Só após 0% tráfego em rotas legadas por 2 releases

---

## 6. Percentual de dependência CRM restante

| Camada | Peso | Legado restante | Contribuição |
|--------|------|-----------------|--------------|
| Modelo de dados | 35% | **100%** | 35.0% |
| Rotas / URLs | 15% | **100%** | 15.0% |
| Permissões / auth | 10% | **100%** | 10.0% |
| Store / API | 15% | **95%** | 14.3% |
| UI visível | 25% | **~42%** | 10.5% |

### **Dependência CRM estimada: ~85%**

*(Após fase 1: UI ~58% relabelada nas telas principais; camadas de dados/rotas/permissões permanecem 100% legadas.)*

Para atingir **<50%**:
1. Adapters de leitura Creator sobre entidades CRM
2. Rotas alias Creator-first com redirects
3. Renomear mocks e seeds (não produção)

---

## 7. Como usar a camada Creator

```ts
import {
  CREATOR_TERMS,
  labelCrmPapel,
  labelPipelineDisplay,
  creatorPageTitle,
  resolveAppBreadcrumbs,
} from "@/modules/creator/domain/terminology";

// Exibir Papel sem alterar valor persistido
labelCrmPapel("Vendedor"); // "Team Member"

// Título de página
creatorPageTitle("Configurações"); // "Configurações — Creator OS"

// Pipeline legado → label Creator
labelPipelineDisplay("pipeline-vendas", "Vendas"); // "Campaign Pipeline"
```

---

## 8. Verificação

```bash
npm run test:navigation
npm run test:creator
npm run build
```

Última atualização: sprint Creator Domain Migration fase 1.
