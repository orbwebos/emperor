import { inspect } from 'util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { isThenable } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  aliases: ['evaluate'],
  description: 'Evaluates JavaScript code (owner-exclusive)',
  preconditions: ['OwnerExclusive'],
})
export class UserCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const code = await args.rest('string');

    const result = await this.eval(message.guildId, code);

    return message.reply(`\`\`\`js\n${result}\`\`\``);
  }

  private async eval(_guildId: string, code: string): Promise<string> {
    let result = null;

    try {
      //       const prelude = `const { container } = require('@sapphire/framework');
      // const { client } = container;

      // const thisGuild = client.guilds.cache.get('${guildId}')

      // async function getFullMessage(channelId, id) {
      //   return thisGuild.channels.cache.get(channelId).messages.fetch(id);
      // }

      // async function getMessage(channelId, id) {
      //   const message = await getFullMessage(channelId, id);
      //   return {
      //     id: message.id,
      //     author: message.author,
      //     content: message.content,
      //     createdAt: message.createdAt,
      //     editedAt: message.editedAt,
      //     createdTimestamp: message.createdTimestamp,
      //     editedTimestamp: message.editedTimestamp,
      //   }
      // }`;
      // eslint-disable-next-line no-eval
      // result = eval(`${prelude}${code}`);
      // eslint-disable-next-line no-eval
      result = eval(code);
    } catch (error) {
      return error;
    }

    if (isThenable(result)) {
      result = await result;
    }

    if (typeof result !== 'string') {
      result = inspect(result, { depth: 0 });
    }

    return result;
  }
}
