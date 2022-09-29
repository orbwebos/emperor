import { config } from './config_manager';
import { prodOtherwise } from './util';

export const registerOptions = prodOtherwise(
  { global: true },
  { guilds: [config.bot.testingGuild] }
);
