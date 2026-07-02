# Communications Data Model

## Source of truth

`communications: CommunicationsSnapshot` embedded in the tenant CRM state is the **authoritative write model** for the Communication Hub.

All hub operations (inbox, tickets, providers, internal notes) read and write through `crm.setCommunications()` / `getCommunications()`.

## Legacy compatibility layer

These CRM arrays remain for backward compatibility and are **not** removed:

| Legacy array | Unified entity | Link field |
|--------------|----------------|------------|
| `conversas` | `Conversation` + `Message` | `legacyConversaId` |
| `emails` | `Conversation` + `Message` | `legacyEmailId` |
| `chamados` | `Ticket` | `legacyChamadoId` |

### Read path

`migrateLegacyCommunications()` imports missing legacy rows into the snapshot on hydrate (deduplicated by legacy IDs).

### Write path (dual-write)

- **Internal chat inbox**: messages also sync to `conversas` via `enviarMensagem` / `marcarConversaLida`.
- **Ticket ↔ chamado status**: bidirectional sync via `chamado-ticket-sync.ts` — one direction per user action, no duplication loops.

### Unread badge

`useCommunicationsUnread` uses `max(legacy conversas unread, snapshot unread)` so either layer can surface counts during migration.

## Mock data

Demo channel conversations (`conv_mock_*`) are injected only when `shouldIncludeMockConversations(tenantId)` is true (`VITE_DEMO_MODE` or demo tenant).

Production tenants never receive automatic mock conversations.
