import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

export function defaultEmperorEmbed(): EmbedBuilder {
  return new EmbedBuilder().setColor(container.config.bot.defaultColor);
}
