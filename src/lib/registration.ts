import { container } from '@sapphire/framework';
import { prodOtherwise } from './util';

export const registerOptions = prodOtherwise(
  { global: true },
  { guilds: [container.config.bot.testingGuild] }
);
