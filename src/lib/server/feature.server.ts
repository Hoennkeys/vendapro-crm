export function isServerDbEnabled(): boolean {
  if (process.env.USE_SERVER_DB === "false") return false;
  return process.env.USE_SERVER_DB === "true" || process.env.VITE_USE_SERVER_DB === "true";
}
