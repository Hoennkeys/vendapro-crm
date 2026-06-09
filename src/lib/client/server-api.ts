/** Ative com VITE_USE_SERVER_DB=true no .env para usar SQLite/API (Fase 7). */
export function isClientServerApiEnabled(): boolean {
  return import.meta.env.VITE_USE_SERVER_DB === "true";
}
