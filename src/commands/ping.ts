import { ChatInputCommandInteraction, Message } from 'discord.js';
import { BrandedEmbed, Command, EmbedTitle, Replier } from 'imperial-discord';
import { config } from '../util/config_manager';
import { registerOptions } from '../util/registration';

export class PingCommand extends Command {
  public constructor() {
    super({
      description: `Replies with statistics about ${config.bot.possessiveName} response.`,
      register: registerOptions,
    });
  }

  public registerApplicationCommands() {
    this.registerChatInputCommand((builder) =>
      builder
        .setName('ping')
        .setDescription(
          `Replies with statistics about ${config.bot.possessiveName} response.`
        )
        .addBooleanOption((option) =>
          option
            .setName('invisible')
            .setDescription(
              `If true, only you will see ${config.bot.possessiveName} response. Default: false.`
            )
        )
    );
  }

  public async chatInputExecute(interaction: ChatInputCommandInteraction) {
    const invisible = Boolean(interaction.options.getBoolean('invisible'));
    const title = new EmbedTitle(this);
    const replier = new Replier(interaction);

    await replier.embedReply(
      title.processing,
      '**Websocket heartbeat:** `...`ms\n**Roundtrip latency**: `...`ms',
      invisible
    );

    const message = await interaction.fetchReply();

    const embed = new BrandedEmbed(this.client).construct({
      title: title.response,
      body:
        `**Websocket heartbeat:** \`${interaction.client.ws.ping}\`ms\n` +
        `**Roundtrip latency**: \`${
          (message as Message).createdTimestamp - interaction.createdTimestamp
        }\`ms`,
      userName: interaction.user.tag,
      avatarUrl: interaction.user.displayAvatarURL(),
    });

    return interaction.editReply({ embeds: [embed] });
  }

  public async messageExecute(message: Message) {
    const title = new EmbedTitle(this);
    const replier = new Replier(message);

    const reply = (await replier.embedReply(
      title.processing,
      '**Websocket heartbeat:** `...`ms\n**Roundtrip latency**: `...`ms'
    )) as Message;

    const embed = new BrandedEmbed(this.client).construct({
      title: title.response,
      body:
        `**Websocket heartbeat:** \`${message.client.ws.ping}\`ms\n` +
        `**Roundtrip latency**: \`${
          reply.createdTimestamp - message.createdTimestamp
        }\`ms`,
      userName: message.author.tag,
      avatarUrl: message.author.displayAvatarURL(),
    });

    return reply.edit({ embeds: [embed] });
  }
}
