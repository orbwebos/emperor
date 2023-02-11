import { readFileSync } from 'fs';
import { AutoreactionsAction } from '../listeners/autoreactions';
import { envSwitch, resolvePathFromSource, snakeCaseToCamelCase } from './util';

export interface ClientSecrets {
  botToken: string;
}

export class ConfigManager {
  public readonly secrets: ClientSecrets;
  public bot: any;
  public general: any;
  public fun: any;

  public constructor() {
    this.bot = {};

    const mid = envSwitch({
      development: 'dev',
      testing: 'test',
      production: 'prod',
    });

    this.secrets = {
      botToken: process.env[`BOT_TOKEN_${mid.toUpperCase()}`],
    };

    const file = readFileSync(resolvePathFromSource(`../.emperor.${mid}.json`));
    const rawConfig = JSON.parse(file.toString());

    Object.entries(rawConfig).forEach(([key, value]) => {
      switch (key) {
        case 'custom.general': {
          const general = {};
          Object.entries(value).forEach(([key2, value2]) => {
            let val = value2;
            if (key2 === 'reaction_units') {
              val = AutoreactionsAction.rawJsonToUnits(value2);
            }
            general[snakeCaseToCamelCase(key2)] = val;
          });
          this.general = general;
          break;
        }
        case 'custom.fun': {
          const fun = {};
          Object.entries(value).forEach(([key2, value2]) => {
            fun[snakeCaseToCamelCase(key2)] = value2;
          });
          this.fun = fun;
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
}
