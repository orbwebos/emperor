import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { LoadType } from 'shoukaku';
import { plural, registerSwitch } from '../../lib/util';
import { editReplyMusicEmbed } from '../../lib/reply';
import { EmperorTrack } from '../../lib/music/EmperorTrack';
import { UserNotInVoiceChannelError } from '../../lib/errors';

@ApplyOptions<Command.Options>({
  description: 'Plays a song through a file',
  preconditions: ['UserIsInVoiceChannel'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addAttachmentOption((option) =>
            option
              .setName('track')
              .setDescription('The file to play')
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName('force')
              .setDescription(
                "Plays the song by force, even if one is currently playing or there's others in the queue"
              )
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129841389526585516'],
        },
        production: {
          idHints: ['1129842109520818316'],
        },
      })
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { music } = this.container;

    await interaction.deferReply();

    const { channel } = music.userVoiceState(interaction);
    if (channel === null) {
      throw new UserNotInVoiceChannelError();
    }

    const result = await music.search({
      query: interaction.options.getAttachment('track').url,
    });

    let tracks: EmperorTrack[] = [];
    switch (result.loadType) {
      case LoadType.TRACK: {
        const t: EmperorTrack = result.data as EmperorTrack;
        t.requester = interaction.member as GuildMember;
        tracks.push(t);
        break;
      }
      case LoadType.PLAYLIST:
        result.data.tracks.forEach((track) => {
          // eslint-disable-next-line no-param-reassign
          (track as EmperorTrack).requester = interaction.member as GuildMember;
        });
        tracks.push(...(result.data.tracks as EmperorTrack[]));
        break;
      case LoadType.SEARCH: {
        const t: EmperorTrack = result.data[0] as EmperorTrack;
        t.requester = interaction.member as GuildMember;
        tracks.push(t);
        break;
      }
      case LoadType.EMPTY:
        return interaction.editReply('No songs found for that search.');
      case LoadType.ERROR:
        throw new Error('There was an error playing that track.'); // TODO: how to deal with non-user errors
      default:
        throw new Error('Impossible load type result'); // TODO: better error
    }

    const player = await music.player(interaction.guildId, channel.id);

    if (!player.track || interaction.options.getBoolean('force')) {
      let track: EmperorTrack;
      if (tracks.length === 1) {
        [track] = tracks;
        tracks = [];
      } else {
        track = tracks.shift();
      }
      await player.play({ track });
      if (tracks.length !== 0) {
        music.queueAdd(interaction.guildId, ...tracks);
      }

      return editReplyMusicEmbed(interaction, { track });
    }

    if (tracks.length === 1) {
      const [track] = tracks;
      music.queueAdd(interaction.guildId, track);

      return editReplyMusicEmbed(interaction, {
        track,
        title: 'Added to queue',
        byline: 'Added by',
      });
    }

    // adding more than one song through playfile shouldn't be possible; the
    // discord UI will only let you upload one file, but I included it anyway
    // for completeness
    music.queueAdd(interaction.guildId, ...tracks);
    return interaction.editReply(
      `Added ${tracks.length} track${plural(tracks)} to queue.`
    );
  }
}
