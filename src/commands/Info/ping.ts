import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { CommandHelper } from '../../lib/CommandHelper';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: `Replies with statistics about Emperor's response`,
})
export class UserCommand extends Command {
  public registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235238556553336'],
        },
        production: {
          idHints: ['1129238445903061023'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const helper = new CommandHelper(interaction, this);

    const msg = await interaction.reply({
      embeds: [
        helper.makeProcessingEmbed(
          '**Websocket heartbeat:** `...`ms\n**Roundtrip latency:** `...`ms'
        ),
      ],
      fetchReply: true,
    });

    const content =
      `**Websocket heartbeat:** \`${this.container.client.ws.ping}\`ms\n` +
      `**Roundtrip latency:** \`${
        msg.createdTimestamp - interaction.createdTimestamp
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
          '**Websocket heartbeat:** `...`ms\n**Roundtrip latency:** `...`ms'
        ),
      ],
    });

    const content =
      `**Websocket heartbeat:** \`${this.container.client.ws.ping}\`ms\n` +
      `**Roundtrip latency:** \`${
        (msg.editedTimestamp || msg.createdTimestamp) -
        (message.editedTimestamp || message.createdTimestamp)
      }\`ms`;

    return msg.edit({
      embeds: [helper.makeResponseEmbed(content)],
    });
  }
}
