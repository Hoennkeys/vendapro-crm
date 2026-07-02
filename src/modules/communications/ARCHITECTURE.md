# Communications Hub — Architecture Notes

## Overview

The Communication Hub lives under `src/modules/communications/` and integrates with the tenant CRM snapshot via `crm-store.tsx`. All evolution is **backward compatible**: legacy routes, arrays, and redirects are preserved.

## Storage providers

Configured with `VITE_COMMUNICATIONS_STORAGE_PROVIDER`:

| Value | Default | Behavior |
|-------|---------|----------|
| `local` | **yes** | Read/write through `crm.getCommunications()` / `setCommunications()` (localStorage or CRM server snapshot) |
| `drizzle` | no | Same in-memory UX as `local`, plus async persist of the communications slice to `tenant_crm_state.state_json` via server functions |

### Fallback chain (storage)

```
local (default)
  └─ crm-store snapshot → localStorage | getCrmStateServerFn

drizzle (opt-in)
  └─ local in-memory path (above)
       └─ on write: saveCommunicationsStateServerFn
            └─ on failure: dev warning, local snapshot retained
```

Server implementation: `repositories/server/drizzle.repository.ts`  
Factory: `repositories/repository-factory.ts`

## Realtime providers

Configured with `VITE_COMMUNICATIONS_REALTIME_PROVIDER`:

| Value | Default | Behavior |
|-------|---------|----------|
| `polling` | **yes** | In-process pub/sub + TanStack Query `refetchInterval` |
| `websocket` | no | Attempts `VITE_COMMUNICATIONS_WS_URL`; **falls back to polling** on missing URL, timeout, or disconnect |

### Fallback chain (realtime)

```
polling (default)
  └─ PollingRealtimeService (in-memory events)

websocket (opt-in)
  └─ WebSocketRealtimeService
       ├─ connect OK → WS publish/subscribe
       └─ any failure → PollingRealtimeService (no feature depends on WS)
```

Factory: `services/realtime/realtime-factory.ts`

## Data model

See `domain/DATA_MODEL.md` for source-of-truth rules and legacy compatibility.

## Ticket ↔ chamado sync

- **Chamado → Ticket**: `atualizarStatusChamado()` + `migrateLegacyCommunications()` via `syncTicketsFromChamados`
- **Ticket → Chamado**: `useUpdateTicketStatusMutation()` with `{ syncTicket: false }` on chamado update to avoid loops

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_COMMUNICATIONS_STORAGE_PROVIDER` | `local` \| `drizzle` |
| `VITE_COMMUNICATIONS_REALTIME_PROVIDER` | `polling` \| `websocket` |
| `VITE_COMMUNICATIONS_WS_URL` | WebSocket endpoint (optional) |
| `VITE_DEMO_MODE` | Inject demo channel conversations when `true` |
| `VITE_USE_SERVER_DB` | Required for drizzle persistence server functions |

## Dev diagnostics

In development (`import.meta.env.DEV`), `lib/dev-diagnostics.ts` logs provider selection, sync events, and persistence failures.

## Route compatibility

Legacy paths preserved as redirects:

- `/comunicacao` → `/communications/inbox` (+ search mapping)
- `/chats` → `/communications/inbox?channel=internal`
- `/emails` → `/communications/inbox?channel=email`
- `/communications` → `/communications/inbox` (index redirect)

Root shortcut `/chats` → tenant demo inbox with `channel=internal`.
