import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { FilterOptions } from 'shoukaku';
import { ApplyOptions } from '@sapphire/decorators';
import { silentTrackReply } from '../../lib/reply';
import { EmperorPlayer } from '../../lib/music/EmperorPlayer';
import { registerSwitch } from '../../lib/util';

@ApplyOptions<Command.Options>({
  description: 'Enables or disables the nightcore effect',
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1141415293906845857'],
        },
        production: {
          idHints: ['1141416877827031201'],
        },
      })
    );
  }

  private filtersAreActive(filters: FilterOptions) {
    if (filters.volume && filters.volume !== 1) {
      return true;
    }
    if (filters.equalizer && filters.equalizer.length !== 0) {
      return true;
    }
    return (
      filters.karaoke ||
      filters.timescale ||
      filters.tremolo ||
      filters.vibrato ||
      filters.rotation ||
      filters.distortion ||
      filters.channelMix ||
      filters.lowPass
    );
  }

  private async handleFilters(player: EmperorPlayer): Promise<boolean> {
    if (!this.filtersAreActive(player.filters)) {
      await player.setFilters({
        equalizer: [
          { band: 0, gain: -0.075 },
          { band: 1, gain: 0.125 },
          { band: 2, gain: 0.125 },
        ],
        timescale: { speed: 1, pitch: 0.95, rate: 1.3 },
      });
      return true;
    }

    await player.clearFilters();
    return false;
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { player } = this.container.getMusic(interaction.guildId);

    const nowActive = await this.handleFilters(player);
    if (nowActive) {
      return interaction.reply('Nightcore effect enabled.');
    }

    return interaction.reply('Nightcore effect disabled.');
  }

  public async messageRun(message: Message) {
    const { player } = this.container.getMusic(message.guildId);

    const nowActive = await this.handleFilters(player);
    if (nowActive) {
      return silentTrackReply(message, 'Nightcore effect enabled.');
    }

    return silentTrackReply(message, 'Nightcore effect disabled.');
  }
}
