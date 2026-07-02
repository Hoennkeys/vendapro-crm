import type { CommunicationProvider } from "./communication-provider.interface";
import type { ProviderConfig } from "../domain/entities";
import { InternalChatProvider } from "./internal-chat.provider";
import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";

class StubChannelProvider extends InternalChatProvider implements CommunicationProvider {
  constructor(
    repos: LocalCommunicationsRepositories,
    readonly type: "telegram" | "discord" | "teams",
    private label: string,
  ) {
    super(repos);
  }

  override async connect(config: ProviderConfig) {
    this.config = config;
    return this.ok(`Modo demo — ${this.label}`);
  }

  override async getConversations() {
    return this.repos.conversationRepo.list({ channelType: this.type });
  }
}

export class TelegramProvider extends StubChannelProvider {
  constructor(repos: LocalCommunicationsRepositories) {
    super(repos, "telegram", "Telegram Bot API");
  }
}

export class DiscordProvider extends StubChannelProvider {
  constructor(repos: LocalCommunicationsRepositories) {
    super(repos, "discord", "Discord Bot");
  }
}

export class TeamsProvider extends StubChannelProvider {
  constructor(repos: LocalCommunicationsRepositories) {
    super(repos, "teams", "Microsoft Teams");
  }
}
