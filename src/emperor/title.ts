import { CommandInteraction } from 'discord.js';

export class EmperorTitle {
  readonly response: string;
  readonly status: string;
  readonly error: string;
  readonly prompt: string;
  readonly choice: string;
  readonly cancelled: string;
  readonly processing: string;
  readonly stateError: string;

  constructor(interaction: CommandInteraction) {
    const commandNameFirstCap =
      interaction.commandName.charAt(0).toUpperCase() +
      interaction.commandName.slice(1);

    const titleTemplate = !(interaction.options.getSubcommand(false) === null)
      ? `${commandNameFirstCap} ${interaction.options.getSubcommand()} `
      : `${interaction.commandName} `;

    this.response = `${titleTemplate}response`;
    this.status = `${titleTemplate}status`;
    this.error = `${titleTemplate}error`;
    this.prompt = `${titleTemplate}prompt`;
    this.choice = `${titleTemplate}choice`;
    this.cancelled = `${titleTemplate}cancelled`;
    this.processing = `${titleTemplate}processing...`;
    this.stateError = `${titleTemplate}state error`;
  }
}
