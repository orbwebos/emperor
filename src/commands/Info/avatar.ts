import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Args, Command } from '@sapphire/framework';
import { ApplicationCommandType, GuildMember, Message } from 'discord.js';
import { registerSwitch, userName } from '../../lib/util';
import { defaultEmperorEmbed } from '../../lib/embeds';
import { replyEmbed, silentTrackReplyEmbed } from '../../lib/reply';

@ApplyOptions<Command.Options>({
  aliases: ['pfp'],
  description: 'Get the avatar URL of the selected user, or your own avatar',
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('avatar')
          .setDescription(
            'Get the avatar URL of the selected user, or your own avatar.'
          )
          .addUserOption((option) =>
            option.setName('target').setDescription("The user's avatar to show")
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235235528261682'],
        },
        production: {
          idHints: ['1129238363845705778'],
        },
      })
    );

    registry.registerContextMenuCommand(
      (builder) =>
        builder.setName('Guild avatar').setType(ApplicationCommandType.User),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235236706848840'],
        },
        production: {
          idHints: ['1129238444250517544'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('target') || interaction.user;

    return replyEmbed(
      interaction,
      defaultEmperorEmbed()
        .setAuthor({ name: userName(user) })
        .setImage(user.displayAvatarURL({ size: 1024 }))
    );
  }

  // TODO: remove this somehow. look at best solution
  // eslint-disable-next-line consistent-return
  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction
  ) {
    if (
      interaction.isUserContextMenuCommand() &&
      interaction.targetMember instanceof GuildMember
    ) {
      return replyEmbed(
        interaction,
        defaultEmperorEmbed()
          .setAuthor({ name: userName(interaction.targetUser) })
          .setImage(interaction.targetMember.displayAvatarURL({ size: 1024 }))
      );
    }
  }

  public async messageRun(message: Message, args: Args) {
    const user = (await args.pickResult('user')).unwrapOr(message.author);

    return silentTrackReplyEmbed(
      message,
      defaultEmperorEmbed()
        .setAuthor({ name: userName(user) })
        .setImage(user.displayAvatarURL({ size: 1024 }))
    );
  }
}
