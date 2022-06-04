import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordTogether } from 'discord-together';
import { Command, EmbedTitle } from 'imperial-discord';
import { ConfigManager } from '../util/config_manager';
import { Replier } from '../util/sender_replier';

const cmdData = new SlashCommandBuilder()
  .setName('youtube')
  .setDescription('Replies with an invite link to a YouTube Together activity.')
  .addBooleanOption((option) =>
    option
      .setName('invisible')
      .setDescription(
        `If true, only you will see ${
          new ConfigManager().bot.name_possessive
        } response. Default: false.`
      )
  );

const cmdExecuter = async (interaction: any) => {
  const invisible: boolean = !!interaction.options.getBoolean('invisible');
  const title = new EmbedTitle(interaction);
  const replier = new Replier(interaction);

  // eslint-disable-next-line no-param-reassign
  interaction.client.discordTogether = new DiscordTogether(interaction.client);
  if (interaction.member.voice.channel) {
    interaction.client.discordTogether
      .createTogetherCode(interaction.member.voice.channel.id, 'youtube')
      .then(async (invite) =>
        replier.reply(
          title.response,
          `[Click here.](${invite.code})`,
          invisible
        )
      );
  } else {
    return replier.reply(
      title.error,
      'You need to be in a voice channel for that.',
      true
    );
  }
};

export const cmd = new Command(cmdData, cmdExecuter);
