import { Listener } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import {
  MessageSubcommandErrorPayload,
  SubcommandPluginEvents,
} from '@sapphire/plugin-subcommands';
import { EmbedBuilder } from 'discord.js';

export class UserListener extends Listener<
  typeof SubcommandPluginEvents.MessageSubcommandError
> {
  public async run(error: Error, payload: MessageSubcommandErrorPayload) {
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

    return reply(payload.message, {
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });
  }
}
