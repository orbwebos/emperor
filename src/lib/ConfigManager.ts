import { readFileSync } from 'fs';
import { ColorResolvable } from 'discord.js';
import { UserListener as AutoreactionsService } from '../listeners/services/autoreactions';
import { envSwitch, resolvePathFromSource, snakeCaseToCamelCase } from './util';

export interface ClientSecrets {
  botToken: string;
}

export interface BotInfo {
  name: string;
  version: string;
  ownerIds: string[];
  defaultColor: ColorResolvable;
}

export interface MusicNodeConfig {
  name: string;
  url: string;
  auth: string;
  secure: boolean;
}

export class ConfigManager {
  public readonly secrets: ClientSecrets;
  public bot: BotInfo;
  public general: any;
  public fun: any;
  public music: MusicNodeConfig;

  public constructor() {
    this.bot = {
      name: '',
      version: '',
      ownerIds: [],
      defaultColor: '#',
    };

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
              val = AutoreactionsService.rawJsonToUnits(value2);
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
        case 'custom.music': {
          const music = {};
          Object.entries(value).forEach(([key2, value2]) => {
            music[snakeCaseToCamelCase(key2)] = value2;
          });
          this.music = music as MusicNodeConfig;
          break;
        }
        default:
          this.bot[snakeCaseToCamelCase(key)] = value;
      }
    });
  }
}
