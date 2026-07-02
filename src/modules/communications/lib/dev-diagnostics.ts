const PREFIX = "[communications]";

import { isDevEnvironment } from "../config/communications.config";

export function commsDevLog(message: string, detail?: unknown) {
  if (!isDevEnvironment()) return;
  if (detail !== undefined) {
    console.debug(`${PREFIX} ${message}`, detail);
    return;
  }
  console.debug(`${PREFIX} ${message}`);
}

export function commsDevWarn(message: string, detail?: unknown) {
  if (!isDevEnvironment()) return;
  if (detail !== undefined) {
    console.warn(`${PREFIX} ${message}`, detail);
    return;
  }
  console.warn(`${PREFIX} ${message}`);
}
