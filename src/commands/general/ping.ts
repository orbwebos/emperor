import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  container,
} from '@sapphire/framework';
import { Message } from 'discord.js';
import { CommandHelper } from '../../lib/command_helper';
import { registerSwitch } from '../../lib/util';

const { config } = container;

@ApplyOptions<Command.Options>({
  description: `Replies with statistics about ${config.bot.possessiveName} response.`,
})
export class PingCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName('ping').setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['906631270048624661'],
          idHints: ['1029597613479182396'],
        },
        production: { idHints: ['1029606357843845190'] },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const helper = new CommandHelper(interaction, this);

    const msg = await interaction.reply({
      embeds: [
        helper.makeProcessingEmbed(
          '**Websocket heartbeat:** `...`ms\n**Roundtrip latency**: `...`ms'
        ),
      ],
      fetchReply: true,
    });
    const createdTime =
      msg instanceof Message ? msg.createdTimestamp : Date.parse(msg.timestamp);

    const content =
      `**Websocket heartbeat:** \`${this.container.client.ws.ping}\`ms\n` +
      `**Roundtrip latency**: \`${
        createdTime - interaction.createdTimestamp
      }\`ms`;

    return interaction.editReply({
      embeds: [helper.makeResponseEmbed(content)],
    });
  }

  public async messageRun(message: Message) {
    const helper = new CommandHelper(message, this);

    const msg = await message.reply({
      embeds: [
        helper.makeProcessingEmbed(
          '**Websocket heartbeat:** `...`ms\n**Roundtrip latency**: `...`ms'
        ),
      ],
    });

    const content =
      `**Websocket heartbeat:** \`${this.container.client.ws.ping}\`ms\n` +
      `**Roundtrip latency**: \`${
        (msg.editedTimestamp || msg.createdTimestamp) -
        (message.editedTimestamp || message.createdTimestamp)
      }\`ms`;

    return msg.edit({
      embeds: [helper.makeResponseEmbed(content)],
    });
  }
}
