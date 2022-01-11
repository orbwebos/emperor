import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordTogether } from 'discord-together';
import { EmperorEmbedder } from '../util/emperor_embedder';
import { EmperorCommand } from '../util/emperor_command';

const cmdData = new SlashCommandBuilder()
  .setName('youtube')
  .setDescription('Replies with an invite link to a YouTube Together activity.');

const cmdExecuter = async interaction => {
  interaction.client.discordTogether = new DiscordTogether(interaction.client);
  const embedder = new EmperorEmbedder(interaction.user);
  if (interaction.member.voice.channel) {
    interaction.client.discordTogether.createTogetherCode(interaction.member.voice.channel.id, 'youtube').then(async invite => {
      const embed = embedder.emperorEmbed('YouTube Together response', `[Click here.](${invite.code})`);
      return interaction.reply({ embeds: [embed] });
    });
  }
  else {
    const embed = embedder.emperorEmbed('YouTube Together error', 'You need to be in a voice channel for that.');
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
