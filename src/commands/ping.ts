import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, EmbedTitle } from 'imperial-discord';
import { CommandInteraction, Message } from 'discord.js';
import { Embedder } from '../util/embedder';
import { ConfigManager } from '../util/config_manager';

const config = new ConfigManager();

const cmdData = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(
    `Replies with statistics about ${config.bot.name_possessive} response.`
  )
  .addBooleanOption((option) =>
    option
      .setName('invisible')
      .setDescription(
        `If true, only you will see ${config.bot.name_possessive} response. Default: false.`
      )
  );

const cmdExecuter = async (interaction: CommandInteraction) => {
  const invisible: boolean = !!interaction.options.getBoolean('invisible');
  const title = new EmbedTitle(interaction);
  const embedder = new Embedder(interaction.user);

  const embedInitial = embedder.embed(
    title.response,
    '**Websocket heartbeat:** `...`ms\n**Roundtrip latency**: `...`ms'
  );

  await interaction.reply({ embeds: [embedInitial], ephemeral: invisible });
  const message = await interaction.fetchReply();

  const embedFinal = embedder.embed(
    title.response,
    `**Websocket heartbeat:** \`${interaction.client.ws.ping}\`ms\n` +
      `**Roundtrip latency**: \`${
        (message as Message).createdTimestamp - interaction.createdTimestamp
      }\`ms`
  );

  return interaction.editReply({ embeds: [embedFinal] });
};

export const cmd = new Command(cmdData, cmdExecuter);
