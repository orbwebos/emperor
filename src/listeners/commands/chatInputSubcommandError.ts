import { Listener } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import {
  ChatInputSubcommandErrorPayload,
  SubcommandPluginEvents,
} from '@sapphire/plugin-subcommands';
import { replyEmbed } from '../../lib/reply';

export class UserListener extends Listener<
  typeof SubcommandPluginEvents.ChatInputSubcommandError
> {
  public async run(error: Error, payload: ChatInputSubcommandErrorPayload) {
    const embed = new EmbedBuilder().setColor(0xc1423f).setTitle('Error');

    if (error.message) {
      embed.setDescription(
        `The \`${payload.command.name}\` command encountered the following error:\`\`\`${error.message}\`\`\``
      );
    } else {
      embed.setDescription(
        `There was an unexpected error while running the \`${payload.command.name} command.\``
      );
    }
    if (Object.hasOwn(error, 'identifier')) {
      const { identifier } = error as Error & { identifier?: string };
      if (identifier) {
        embed.setFooter({ text: identifier });
      }
    }

    if (payload.interaction.deferred || payload.interaction.replied) {
      return payload.interaction.editReply({ embeds: [embed] });
    }

    return replyEmbed(payload.interaction, embed);
  }
}
