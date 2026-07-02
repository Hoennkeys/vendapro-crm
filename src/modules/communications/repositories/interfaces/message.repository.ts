import type { Message } from "../../domain/entities";

export interface MessageRepository {
  listByConversation(conversationId: string): Message[];
  getById(id: string): Message | undefined;
  save(message: Message): void;
  markRead(conversationId: string, messageIds?: string[]): void;
}
