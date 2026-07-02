import type { Attachment } from "../../domain/entities";

export interface AttachmentRepository {
  listByMessage(messageId: string): Attachment[];
  save(attachment: Attachment): void;
}
