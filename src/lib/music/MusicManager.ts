import { isNullOrUndefined } from 'util';
import { Client, CommandInteraction, Message, VoiceState } from 'discord.js';
import {
  Connectors,
  LavalinkResponse,
  Node,
  NodeOption,
  Player,
  PlayerUpdate,
  Shoukaku,
  TrackEndEvent,
  TrackEndReason,
  TrackExceptionEvent,
  TrackStartEvent,
  TrackStuckEvent,
  WebSocketClosedEvent,
} from 'shoukaku';
import { Option, container } from '@sapphire/framework';
import { isValidUrl } from '../util';
import { TrackQueue, RepeatingMode, SkipResult } from './TrackQueue';
import { EmperorPlayer } from './EmperorPlayer';
import { EmperorTrack } from './EmperorTrack';

export interface MusicSetupOptions {
  client: Client;
  nodes: NodeOption[];
  onError?: (name: string, error: Error) => void;
}

export function format(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function toTimestamp(position: number, length: number): string {
  return `${format(position)} / ${format(length)}`;
}

export function timestampToMs(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else {
    [seconds] = parts;
  }

  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

export class MusicManager {
  public lavalink: Shoukaku;
  public queues: Map<string, TrackQueue>;

  public constructor() {
    this.queues = new Map();
  }

  /**
   * This should be called before connecting to the gateway.
   */
  public setup(options: MusicSetupOptions) {
    this.lavalink = new Shoukaku(
      new Connectors.DiscordJS(options.client),
      options.nodes,
      { structures: { player: EmperorPlayer } }
    );

    if (isNullOrUndefined(options.onError)) {
      this.lavalink.on('error', (_, error) => console.error(error)); // fix this somehow
    } else {
      this.lavalink.on('error', options.onError);
    }
  }

  public bestNode(): Node {
    return this.lavalink.getIdealNode();
  }

  public async resolveIdentifier(
    identifier: string
  ): Promise<LavalinkResponse> {
    return this.bestNode().rest.resolve(identifier);
  }

  public async search(options: {
    query: string;
    defaultSourcePrefix?: string;
    stripComparisonSigns?: boolean;
  }): Promise<LavalinkResponse> {
    const defaultSourcePrefix = options.defaultSourcePrefix ?? 'dzsearch';
    const stripComparisonSigns = options.stripComparisonSigns ?? true;
    const query = stripComparisonSigns
      ? options.query.replace(/^<+|>+$/g, '')
      : options.query;

    if (isValidUrl(query)) {
      return this.resolveIdentifier(query);
    }
    return this.resolveIdentifier(`${defaultSourcePrefix}:${query}`);
  }

  public userVoiceState(from: CommandInteraction | Message): VoiceState {
    if (from instanceof Message) {
      return from.guild.members.cache.get(from.author.id).voice;
    }
    return from.guild.members.cache.get(from.user.id).voice;
  }

  public async player(
    guildId: string,
    channelId: string
  ): Promise<EmperorPlayer> {
    if (!this.lavalink.connections.has(guildId)) {
      const plr = (
        await this.lavalink.joinVoiceChannel({
          guildId,
          channelId,
          shardId: 0,
        })
      )
        .on('end', this.onTrackEnd.bind(this))
        .on('closed', (event: WebSocketClosedEvent) =>
          container.logger.debug(
            `player: closed (${event.guildId}) [${event.reason}]`
          )
        )
        .on('exception', (event: TrackExceptionEvent) =>
          container.logger.debug(
            `player: exception (${event.guildId}) [${event.exception}]`
          )
        )
        .on('resumed', (player: Player) =>
          container.logger.debug(
            `player: resumed (${player.guildId}), track: ${player.track}`
          )
        )
        .on('start', (event: TrackStartEvent) => {
          container.logger.debug(
            `player: start (${event.guildId}), track: ${event.track.info.title}`
          );
        })
        .on('stuck', (event: TrackStuckEvent) =>
          container.logger.debug(
            `player: stuck (${event.guildId}), track: ${event.track} [${event.thresholdMs}]`
          )
        )
        .on('update', (data: PlayerUpdate) => {
          // container.logger.debug(
          //   `player: update (${data.guildId}) [connected: ${data.state.connected}] [position: ${data.state.position}] [time: ${data.state.time}]`
          // );
          const playerOption = this.existingPlayer(data.guildId);
          if (playerOption.isNone()) {
            return;
          }
          const player = playerOption.unwrap();
          player.lastPosition = data.state.position ?? 0;
          player.lastUpdated = data.state.time;
        }) as EmperorPlayer;
      if (!this.queues.get(guildId)) {
        this.queues.set(guildId, new TrackQueue());
      }
      return plr;
    }

    return this.lavalink.players.get(guildId) as EmperorPlayer;
  }

  public mustPlayer(guildId: string): EmperorPlayer {
    const player = this.lavalink.players.get(guildId);
    if (!player) {
      throw new Error('expected player in guild');
    }

    return player as EmperorPlayer;
  }

  public existingPlayer(guildId: string): Option<EmperorPlayer> {
    const player = this.lavalink.players.get(guildId);
    return player ? Option.some(player as EmperorPlayer) : Option.none;
  }

  public queueGet(guildId: string): EmperorTrack[] | undefined {
    return this.queues.get(guildId)?.getAll();
  }

  public queueAdd(guildId: string, ...track: EmperorTrack[]) {
    let queue = this.queues.get(guildId);

    if (!queue) {
      queue = new TrackQueue();
      this.queues.set(guildId, queue);
    }

    queue.add(track);
  }

  public queueNextModeSafe(
    guildId: string,
    currentTrack?: EmperorTrack
  ): EmperorTrack | undefined {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }
    const track = queue.dequeue();
    if (
      queue.mode === RepeatingMode.QUEUE &&
      !isNullOrUndefined(currentTrack)
    ) {
      queue.add([currentTrack]);
    }
    return track;
  }

  public queueNext(guildId: string): EmperorTrack | undefined {
    return this.queues.get(guildId)?.dequeue();
  }

  public queueSkip(
    guildId: string,
    amount: number = 1,
    force = false
  ): SkipResult {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }

    const current = this.existingPlayer(guildId).unwrap().unencodedTrack;

    if (force) {
      return queue.forceSkip(current, amount);
    }

    return queue.skip(current, amount);
  }

  public queueClear(guildId: string): EmperorTrack[] | undefined {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }

    return queue.clear();
  }

  public queueMode(guildId: string): RepeatingMode | undefined {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }

    container.logger.debug(`queue mode for ${guildId}: ${queue.mode}`);

    return queue.mode;
  }

  public queueModeSet(
    guildId: string,
    mode: RepeatingMode
  ): RepeatingMode | undefined {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }

    const ret = queue.mode;
    queue.mode = mode;
    return ret;
  }

  public queueShuffle(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return false;
    }

    if (queue.tracks.length <= 1) {
      return false;
    }

    queue.shuffle();

    return true;
  }

  public queueRemove(
    guildId: string,
    trackIndex: number
  ): EmperorTrack | undefined {
    const queue = this.queues.get(guildId);
    if (!queue) {
      return undefined;
    }

    return queue.remove(trackIndex);
  }

  public onTrackEnd(event: TrackEndEvent): void {
    const playerResult = this.existingPlayer(event.guildId);
    if (playerResult.isNone()) {
      return;
    }
    const player = playerResult.unwrap();

    const trackThatFinished = player.unencodedTrack;

    if (event.reason !== 'replaced' && event.reason !== 'stopped') {
      [player.lastTrack, player.track, player.unencodedTrack] = [
        player.unencodedTrack,
        null,
        null,
      ];
    }

    if (!MusicManager.mayStartNext(event.reason)) {
      if (event.reason !== 'replaced') {
        [player.lastTrack, player.unencodedTrack] = [
          player.unencodedTrack,
          null,
        ];
      }
      return;
    }

    let track: EmperorTrack;
    // eslint-disable-next-line default-case
    switch (this.queueMode(event.guildId)) {
      case RepeatingMode.NONE:
        track = this.queueNext(event.guildId);
        break;
      case RepeatingMode.TRACK:
        track = trackThatFinished;
        break;
      case RepeatingMode.QUEUE:
        this.queueAdd(event.guildId, trackThatFinished);
        track = this.queueNext(event.guildId);
    }

    if (!track) {
      [player.lastTrack, player.unencodedTrack] = [player.unencodedTrack, null];
      return;
    }
    player.playTrack({ track: track.encoded });
    [player.lastTrack, player.unencodedTrack] = [player.unencodedTrack, track];
  }

  public static mayStartNext(reason: TrackEndReason): boolean {
    switch (reason) {
      case 'finished':
      case 'loadFailed':
        return true;
      default:
        return false;
    }
  }
}
