import { EmperorEvent } from '../util/emperor_event';
import * as log from '../util/logging';

const name = 'interactionCreate';
const once = false;
const executer = async interaction => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.options.getSubcommand(false) === null) {
    log.info(interaction.client, `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}`);
  }
  else {
    log.info(interaction.client, `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName} ${interaction.options.getSubcommand(false)}`);
  }

  if (!interaction.client.commands.has(interaction.commandName)) return;
  
  try {
    const inter = interaction.client.commands.get(interaction.commandName);
    await inter(interaction);
  }
  catch (error) {
    log.error(interaction.client, error);
    await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
  }
};

export const event = new EmperorEvent(name, once, executer);
