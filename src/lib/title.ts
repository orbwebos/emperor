import { Command } from '@sapphire/framework';

export class TitleHelper {
  public response: string;
  public status: string;
  public error: string;
  public prompt: string;
  public choice: string;
  public cancelled: string;
  public processing: string;
  public stateError: string;

  public constructor(commandOrTemplate: Command | string) {
    if (commandOrTemplate instanceof Command) {
      this.setTitles(commandOrTemplate.name);
    } else {
      this.setTitles(commandOrTemplate);
    }
  }

  public setTitles(template: string) {
    this.response = `${template} response`;
    this.status = `${template} status`;
    this.error = `${template} error`;
    this.prompt = `${template} prompt`;
    this.choice = `${template} choice`;
    this.cancelled = `${template} cancelled`;
    this.processing = `${template} processing...`;
    this.stateError = `${template} state error`;
  }
}
