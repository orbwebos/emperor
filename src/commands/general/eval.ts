import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { isThenable } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<Command.Options>({
  aliases: ['evaluate'],
  description: 'Evaluates JavaScript code. Owner-exclusive.',
  preconditions: ['OwnerExclusive'],
})
export class EvalCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const code = await args.rest('string');

    const result = await this.eval(code);

    return message.reply(`\`\`\`js\n${result}\`\`\``);
  }

  private async eval(code: string): Promise<string> {
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
