import { StateManager } from './state_manager';
import { snakeCaseToCamelCase } from './string_utils';

export interface ClientSecrets {
  botToken: string;
}

export class ConfigManager {
  public readonly secrets: ClientSecrets;
  public bot: any;
  public general: any;
  public wordFilterConfig: any;

  public constructor() {
    this.bot = {};
    this.secrets = {
      botToken: process.env.BOT_TOKEN,
    };

    const rawConfig = new StateManager('../.imperialrc').readSync();

    Object.entries(rawConfig).forEach(([key, value]) => {
      switch (key) {
        case 'custom.general': {
          const general = {};
          Object.entries(value).forEach(([key2, value2]) => {
            general[snakeCaseToCamelCase(key2)] = value2;
          });
          this.general = general;
          break;
        }
        case 'custom.word_filter': {
          const wordFilterConf = {};
          Object.entries(value).forEach(([key2, value2]) => {
            wordFilterConf[snakeCaseToCamelCase(key2)] = value2;
          });
          this.wordFilterConfig = wordFilterConf;
          break;
        }
        case 'name_possessive':
          this.bot.possessiveName = value;
          break;
        default:
          this.bot[snakeCaseToCamelCase(key)] = value;
      }
    });
  }

  public wordFilter() {
    return this.wordFilterConfig;
  }
}

export const config = new ConfigManager();
