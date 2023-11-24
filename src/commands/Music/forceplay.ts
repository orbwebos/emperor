import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { LoadType } from 'shoukaku';
import { userName } from '../../lib/util';
import { silentTrackReply, silentTrackReplyMusicEmbed } from '../../lib/reply';
import { EmperorTrack } from '../../lib/music/EmperorTrack';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('force play', 'play force', 'f play', 'play f'),
  description: 'Plays a song',
  preconditions: ['UserIsInVoiceChannel'],
})
export class UserCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const { music } = this.container;

    const { channel } = music.userVoiceState(message);

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
      guildId: message.guildId,
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
}
