import { ChatInputCommandInteraction, Message } from 'discord.js';
import {
  Command,
  EmbedTitle,
  Replier,
  variantsMessageTrigger,
} from 'imperial-discord';
import { config } from '../../util/config_manager';

export class MinesweeperCommand extends Command {
  public constructor() {
    super({
      description: 'Sends a game of minesweeper.',
      register: {
        guilds: [config.bot.testingGuild],
      },
    });
  }

  public registerApplicationCommand() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('minesweeper')
        .setDescription('Sends a game of minesweeper.')
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.name_possessive} response. Default: false.`
            )
        )
    );
  }

  public registerMessageTrigger(message: Message): boolean {
    return variantsMessageTrigger(message.content, 'mine-sweeper');
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    return new Replier(interaction).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.',
      Boolean(interaction.options.getBoolean('invisible'))
    );
  }

  public async messageExecute(message: Message) {
    return new Replier(message).embedReply(
      new EmbedTitle(this).response,
      'This command is in construction.'
    );
  }
}
