import type { CommunicationsSnapshot } from "../../domain/entities";
import {
  getCommunicationsStorageProvider,
  type CommunicationsStorageProvider,
} from "../config/communications.config";
import { commsDevLog, commsDevWarn } from "../lib/dev-diagnostics";
import {
  createLocalCommunicationsRepositories,
  type CommunicationsStateGetter,
  type CommunicationsStateUpdater,
  type LocalCommunicationsRepositories,
} from "./local/local-storage.repository";
import { saveCommunicationsStateServerFn } from "../api/communications.functions";

export type CommunicationsRepositories = LocalCommunicationsRepositories & {
  storageProvider: CommunicationsStorageProvider;
};

export function createCommunicationsRepositories(input: {
  tenantId: string;
  getSnapshot: CommunicationsStateGetter;
  setSnapshot: CommunicationsStateUpdater;
}): CommunicationsRepositories {
  const storageProvider = getCommunicationsStorageProvider();
  commsDevLog("storage provider", { storageProvider, tenantId: input.tenantId });

  const setSnapshotWithPersistence: CommunicationsStateUpdater = (updater) => {
    input.setSnapshot((current) => {
      const next = updater(current);
      if (storageProvider === "drizzle") {
        void persistCommunicationsToDrizzle(input.tenantId, next).catch((error) => {
          commsDevWarn("drizzle persistence failed — local snapshot retained", error);
        });
      }
      return next;
    });
  };

  const repos = createLocalCommunicationsRepositories(input.getSnapshot, setSnapshotWithPersistence);

  return {
    ...repos,
    storageProvider,
  };
}

async function persistCommunicationsToDrizzle(tenantId: string, snapshot: CommunicationsSnapshot) {
  await saveCommunicationsStateServerFn({
    data: { tenantId, communications: snapshot },
  });
}
