import { SlashCommandBuilder } from '@discordjs/builders';
import { container } from '@sapphire/framework';

/**
 * Creates an optional ephemeral toggle in a slash command builder.
 *
 * @warning
 * This method performs no type-checking.
 * Please verify that a boolean option can actually be attached.
 * Only use this function on an otherwise complete builder.
 *
 * @example
 * ```ts
 * const builder = invisibleOption(
 *   new SlashCommandBuilder()
 *     .setName('command')
 *     .setDescription('Lorem ipsum.')
 * );
 * ```
 *
 * @param builder The builder to attach the option to.
 * @returns A builder with the boolean option attached.
 */
export function invisibleOption<T>(builder: T): T {
  (builder as unknown as SlashCommandBuilder).addBooleanOption((option) =>
    option
      .setName('invisible')
      .setDescription(
        `If true, only you will see ${container.config.bot.name_possessive} response. Default: false.`
      )
  );

  return builder;
}
