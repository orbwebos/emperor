import { DMChannel, Message } from 'discord.js';
import { Handler, processMessage } from 'imperial-discord';
import { config } from '../util/config_manager';

export class MessageCreateHandler extends Handler {
  public async execute(message: Message) {
    if (message.author.bot) return;

    if (
      config.general.messageProcessingChannelsBlacklist.includes(
        message.channelId
      )
    ) {
      return;
    }

    if (!(await processMessage(message))) {
      if (message.channel instanceof DMChannel) {
        this.logger.debug(`${message.author.tag} said: ${message.content}`);
      }
    }
  }
}
