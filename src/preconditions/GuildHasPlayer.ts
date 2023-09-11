import { AllFlowsPrecondition } from '@sapphire/framework';
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from 'discord.js';

export class GuildHasPlayerPrecondition extends AllFlowsPrecondition {
  #message = 'No listening session is active.';

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.guildHasPlayer(interaction.guildId);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.guildHasPlayer(interaction.guildId);
  }

  public override messageRun(message: Message) {
    return this.guildHasPlayer(message.guildId);
  }

  private guildHasPlayer(guildId: string) {
    return this.container.music.existingPlayer(guildId).mapOrElse(
      () => this.error({ message: this.#message }),
      () => this.ok()
    );
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    GuildHasPlayer: never;
  }
}
