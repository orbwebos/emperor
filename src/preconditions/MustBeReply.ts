import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export class MustBeReplyPrecondition extends Precondition {
  #message = 'Your message must be a reply to another message';

  public override messageRun(message: Message) {
    if (message.reference === null) {
      return this.error({ message: this.#message });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    MustBeReply: never;
  }
}
