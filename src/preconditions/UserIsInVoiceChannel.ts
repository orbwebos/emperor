import { AllFlowsPrecondition } from '@sapphire/framework';
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from 'discord.js';
import { CommandObject } from '../lib/util';

export class UserIsInVoiceChannelPrecondition extends AllFlowsPrecondition {
  #message = 'You need to be in a voice channel for that.';

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.userIsInVoiceChannel(interaction);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.userIsInVoiceChannel(interaction);
  }

  public override messageRun(message: Message) {
    return this.userIsInVoiceChannel(message);
  }

  private userIsInVoiceChannel(obj: CommandObject) {
    const { music } = this.container;

    const { channel } = music.userVoiceState(obj);
    if (!channel) {
      return this.error({ message: this.#message });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    UserIsInVoiceChannel: never;
  }
}
