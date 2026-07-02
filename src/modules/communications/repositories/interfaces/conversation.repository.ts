import type { ConversationFilters } from "../../types/provider.types";
import type { Conversation, CommunicationsSnapshot } from "../../domain/entities";

export interface ConversationRepository {
  getSnapshot(): CommunicationsSnapshot;
  list(filters?: ConversationFilters): Conversation[];
  getById(id: string): Conversation | undefined;
  save(conversation: Conversation): void;
  update(id: string, patch: Partial<Conversation>): void;
  delete(id: string): void;
}
