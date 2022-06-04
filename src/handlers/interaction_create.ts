import { Client, Interaction } from 'discord.js';
import { Handler } from 'imperial-discord';

export default class InteractionCreateHandler extends Handler {
  public constructor() {
    super('interactionCreate', false);
  }

  public static async execute(interaction: Interaction, client: Client) {
    if (!interaction.isCommand()) {
      return;
    }
    if (interaction.options.getSubcommand(false) === null) {
      client.logger.info(
        `${interaction.user.tag} in #${
          (interaction.channel as any).name
        } triggered an interaction: ${interaction.commandName}`
      );
    } else {
      client.logger.info(
        `${interaction.user.tag} in #${
          (interaction.channel as any).name
        } triggered an interaction: ${
          interaction.commandName
        } ${interaction.options.getSubcommand(false)}`
      );
    }

    if (!client.commands.has(interaction.commandName)) return;

    try {
      const inter = client.commands.get(interaction.commandName) as any;
      await inter(interaction);
    } catch (error) {
      client.logger.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command.',
        ephemeral: true,
      });
    }
  }
}
