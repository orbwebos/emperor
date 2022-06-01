import { Interaction } from 'discord.js';
import { EmperorEvent } from '../emperor/event';
import { EmperorClient } from '../emperor/client';
import { logger } from '../emperor/logger';

export default class InteractionCreateEvent extends EmperorEvent {
  constructor() {
    super('interactionCreate', false);
  }

  static async execute(interaction: Interaction, client: EmperorClient) {
    if (!interaction.isCommand()) {
      return;
    }
    if (interaction.options.getSubcommand(false) === null) {
      logger.info(
        `${interaction.user.tag} in #${
          (interaction.channel as any).name
        } triggered an interaction: ${interaction.commandName}`
      );
    } else {
      logger.info(
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
      logger.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command.',
        ephemeral: true,
      });
    }
  }
}
