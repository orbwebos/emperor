import { StateManager } from './state_manager';

export type Secrets = {
  botToken: string;
}

export class ConfigManager {
  public readonly secrets: Secrets;
  public readonly bot: any;
  public readonly general: any;

  constructor() {
    this.secrets = {
      botToken: process.env.BOT_TOKEN
    }
    const botManager = new StateManager('../config/bot.json')
    const generalManager = new StateManager('../config/general.json');
    this.bot = botManager.readSync();
    this.general = generalManager.readSync();
  }

  wordFilter() {
    return new StateManager('../config/word_filter.json').readSync();
  }
}
