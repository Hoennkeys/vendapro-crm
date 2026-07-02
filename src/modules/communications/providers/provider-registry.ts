import type { LocalCommunicationsRepositories } from "../repositories/local/local-storage.repository";
import type { CommunicationProvider } from "./communication-provider.interface";
import type { CommunicationChannelType } from "../domain/entities";
import { InternalChatProvider } from "./internal-chat.provider";
import { EmailProvider } from "./email.provider";
import { WhatsAppProvider } from "./whatsapp.provider";
import { SlackProvider } from "./slack.provider";
import { CrispProvider } from "./crisp.provider";
import { TelegramProvider } from "./telegram.provider";
import { DiscordProvider } from "./discord.provider";
import { TeamsProvider } from "./teams.provider";

export type ProviderFactory = (repos: LocalCommunicationsRepositories) => CommunicationProvider;

const factories: Record<CommunicationChannelType, ProviderFactory> = {
  internal: (repos) => new InternalChatProvider(repos),
  email: (repos) => new EmailProvider(repos),
  whatsapp: (repos) => new WhatsAppProvider(repos),
  slack: (repos) => new SlackProvider(repos),
  crisp: (repos) => new CrispProvider(repos),
  telegram: (repos) => new TelegramProvider(repos),
  discord: (repos) => new DiscordProvider(repos),
  teams: (repos) => new TeamsProvider(repos),
  webchat: (repos) => new InternalChatProvider(repos),
};

export class ProviderRegistry {
  private instances = new Map<CommunicationChannelType, CommunicationProvider>();

  constructor(private repos: LocalCommunicationsRepositories) {}

  get(type: CommunicationChannelType): CommunicationProvider {
    let instance = this.instances.get(type);
    if (!instance) {
      const factory = factories[type];
      instance = factory(this.repos);
      this.instances.set(type, instance);
    }
    return instance;
  }

  listEnabled(): CommunicationProvider[] {
    const providers = this.repos.providerRepo.list().filter((p) => p.enabled);
    return providers.map((p) => this.get(p.type));
  }

  async connectAll(): Promise<void> {
    for (const config of this.repos.providerRepo.list()) {
      if (!config.enabled) continue;
      const provider = this.get(config.type);
      const status = await provider.connect(config);
      this.repos.providerRepo.update(config.id, {
        status: status.status,
        lastSyncAt: status.lastSyncAt,
        errorMessage: status.message,
      });
    }
  }
}
