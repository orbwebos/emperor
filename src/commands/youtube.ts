import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordTogether } from 'discord-together';
import { EmperorCommand } from '../emperor/command';
import { ConfigManager } from '../util/config_manager';
import { Replier } from '../util/sender_replier';
import { EmperorTitle } from '../emperor/title';

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

const cmdExecuter = async (i) => {
  const invisible: boolean = !!i.options.getBoolean('invisible');
  const title = new EmperorTitle(i);
  const replier = new Replier(i);

  i.client.discordTogether = new DiscordTogether(i.client);
  if (i.member.voice.channel) {
    i.client.discordTogether
      .createTogetherCode(i.member.voice.channel.id, 'youtube')
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

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
