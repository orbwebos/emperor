import { AllFlowsPrecondition } from '@sapphire/framework';
import {
  CommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from 'discord.js';

export class OwnerExclusivePrecondition extends AllFlowsPrecondition {
  #message = 'You need owner permission to run this.';

  public override chatInputRun(interaction: CommandInteraction) {
    return this.checkIfOwner(interaction.user.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkIfOwner(interaction.user.id);
  }

  public override messageRun(message: Message) {
    return this.checkIfOwner(message.author.id);
  }

  private checkIfOwner(id: string) {
    return this.container.config.bot.ownerIds.includes(id)
      ? this.ok()
      : this.error({ message: this.#message });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    OwnerExclusive: never;
  }
}
