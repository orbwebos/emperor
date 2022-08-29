import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from 'imperial-discord';

export class AvatarCommand extends Command {
  public constructor() {
    super({
      description:
        'Get the avatar URL of the selected user, or your own avatar.',
    });
  }

  public registerApplicationCommand() {
    return new SlashCommandBuilder()
      .setName('avatar')
      .setDescription(
        'Get the avatar URL of the selected user, or your own avatar.'
      )
      .addUserOption((option) =>
        option.setName('target').setDescription("The user's avatar to show")
      );
  }

  public chatInputExecute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('target');

    if (user) {
      return interaction.reply(
        `${user.username}'s avatar: ${user.displayAvatarURL({
          extension: 'png',
          size: 1024,
        })}`
      );
    }

    return interaction.reply(
      `Your avatar: ${interaction.user.displayAvatarURL({
        extension: 'png',
        size: 1024,
      })}`
    );
  }
}
