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

    let highlighting = 'js';
    const result = await this.eval(message.guildId, code);
    if (result instanceof Error) {
      // don't set the highlighting language
      // as JavaScript when there's been an error
      highlighting = '';
    }

    return message.reply(`\`\`\`${highlighting}\n${result}\`\`\``);
  }

  private async eval(_guildId: string, code: string): Promise<string | Error> {
    let result = null;

    try {
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
