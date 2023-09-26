import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';
import { LoadType } from 'shoukaku';
import { registerSwitch, userName } from '../../lib/util';
import {
  editReplyMusicEmbed,
  silentTrackReply,
  silentTrackReplyMusicEmbed,
} from '../../lib/reply';
import { EmperorTrack } from '../../lib/music/EmperorTrack';
import { UserNotInVoiceChannelError } from '../../lib/errors';

@ApplyOptions<Command.Options>({
  description: 'Plays a song',
  preconditions: ['UserIsInVoiceChannel'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName('query')
              .setDescription('The query you want to play')
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
          idHints: ['1129235148244779048'],
        },
        production: {
          idHints: ['1129238274582511797'],
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
      query: interaction.options.getString('query'),
      defaultSourcePrefix: 'ytsearch',
    });

    let playlistName = '';
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
        playlistName = result.data.info.name;
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
      let playlistBlurb = '';
      let track: EmperorTrack;

      if (tracks.length === 1) {
        [track] = tracks;
        tracks = [];
      } else {
        track = tracks.shift();
      }

      await player.play({ track });

      if (tracks.length !== 0) {
        const plist = playlistName
          ? `playlist "${playlistName}"`
          : 'an unknown playlist';
        const plural = tracks.length === 1 ? '' : 's';
        playlistBlurb = `Added ${tracks.length} track${plural} to the queue from ${plist}`;
        music.queueAdd(interaction.guildId, ...tracks);
      }

      const footer = playlistBlurb
        ? `Requested by ${userName(interaction.user)} • ${playlistBlurb}`
        : `Requested by ${userName(interaction.user)}`;

      return editReplyMusicEmbed(interaction, {
        track,
        footerOverride: footer,
      });
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

    music.queueAdd(interaction.guildId, ...tracks);
    const plist = playlistName
      ? `playlist **${playlistName}**.`
      : 'an unknown playlist.';
    const plural = tracks.length === 1 ? '' : 's';
    return interaction.editReply(
      `Added ${tracks.length} track${plural} to the queue from ${plist}`
    );
  }

  public async messageRun(message: Message, args: Args) {
    const { music } = this.container;

    const { channel } = music.userVoiceState(message);
    if (channel === null) {
      throw new UserNotInVoiceChannelError();
    }

    let query = '';
    const queryResult = await args.restResult('string');
    if (queryResult.isErr()) {
      if (message.attachments.size > 0) {
        query = message.attachments.first().url;
      }
    } else {
      query = queryResult.unwrap();
    }

    if (!query) {
      return silentTrackReply(
        message,
        'You need to provide a query to search or file to play.'
      );
    }

    const result = await music.search({
      query,
      defaultSourcePrefix: 'ytsearch',
    });

    let playlistName = '';
    let tracks: EmperorTrack[] = [];
    switch (result.loadType) {
      case LoadType.TRACK: {
        const t: EmperorTrack = result.data as EmperorTrack;
        t.requester = message.member;
        tracks.push(t);
        break;
      }
      case LoadType.PLAYLIST:
        result.data.tracks.forEach((track) => {
          // eslint-disable-next-line no-param-reassign
          (track as EmperorTrack).requester = message.member;
        });
        tracks.push(...(result.data.tracks as EmperorTrack[]));
        playlistName = result.data.info.name;
        break;
      case LoadType.SEARCH: {
        const t: EmperorTrack = result.data[0] as EmperorTrack;
        t.requester = message.member;
        tracks.push(t);
        break;
      }
      case LoadType.EMPTY:
        return silentTrackReply(message, 'No songs found for that search.');
      case LoadType.ERROR:
        throw new Error('There was an error playing that track.'); // TODO: how to deal with non-user errors
      default:
        throw new Error('Impossible load type result'); // TODO: better error
    }

    const player = await music.player(message.guildId, channel.id);

    if (!player.track) {
      let playlistBlurb = '';
      let track: EmperorTrack;

      if (tracks.length === 1) {
        [track] = tracks;
        tracks = [];
      } else {
        track = tracks.shift();
      }

      await player.play({ track });

      if (tracks.length !== 0) {
        const plist = playlistName
          ? `playlist "${playlistName}"`
          : 'an unknown playlist';
        const plural = tracks.length === 1 ? '' : 's';
        playlistBlurb = `Added ${tracks.length} track${plural} to the queue from ${plist}`;
        music.queueAdd(message.guildId, ...tracks);
      }

      const footer = playlistBlurb
        ? `Requested by ${userName(message.author)} • ${playlistBlurb}`
        : `Requested by ${userName(message.author)}`;

      return silentTrackReplyMusicEmbed(message, {
        track,
        footerOverride: footer,
      });
    }

    if (tracks.length === 1) {
      const [track] = tracks;
      music.queueAdd(message.guildId, track);

      return silentTrackReplyMusicEmbed(message, {
        track,
        title: 'Added to queue',
        byline: 'Added by',
      });
    }

    music.queueAdd(message.guildId, ...tracks);
    const plist = playlistName
      ? `playlist **${playlistName}**.`
      : 'an unknown playlist.';
    const plural = tracks.length === 1 ? '' : 's';
    const playlistBlurb = `Added ${tracks.length} track${plural} to the queue from ${plist}`;

    return silentTrackReply(message, playlistBlurb);
  }
}
