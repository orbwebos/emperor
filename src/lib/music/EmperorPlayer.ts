import { isNullOrUndefined } from 'util';
import { Player } from 'shoukaku';
import { EmperorTrack } from './EmperorTrack';

export interface EmperorPlayOptions {
  track: EmperorTrack;
  noReplace?: boolean;
  pause?: boolean;
  startTime?: number;
  endTime?: number;
  volume?: number;
}

export class EmperorPlayer extends Player {
  public unencodedTrack: EmperorTrack;
  public lastTrack: EmperorTrack;
  public lastPosition: number;
  public lastUpdated: number;

  public async seekToSafe(position: number): Promise<void> {
    this.position = position;
    this.lastPosition = position;
    this.lastUpdated = new Date().getTime();
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { position },
    });
  }

  public updateUnencodedTrackPosition(): boolean {
    if (!this.unencodedTrack) {
      return false;
    }

    this.unencodedTrack.info.position = this.getPosition();
    return true;
  }

  public getUnencodedTrack(updatePosition?: boolean): EmperorTrack {
    if (isNullOrUndefined(updatePosition) || updatePosition) {
      this.updateUnencodedTrackPosition();
    }

    return this.unencodedTrack;
  }

  public getPosition(): number {
    if (!this.track) return 0;

    if (this.paused) {
      return Math.min(this.lastPosition, this.unencodedTrack.info.length);
    }

    const currentTime = Date.now();

    const timePassed = currentTime - this.lastUpdated;
    return Math.min(
      this.lastPosition + timePassed,
      this.unencodedTrack.info.length
    );
  }

  public play(options: EmperorPlayOptions): Promise<void> {
    this.unencodedTrack = options.track;

    return this.playTrack({
      track: options.track.encoded,
      options: {
        noReplace: options.noReplace,
        pause: options.pause,
        startTime: options.startTime,
        endTime: options.endTime,
        volume: options.volume,
      },
    });
  }

  public async stop(): Promise<void> {
    await this.stopTrack();
    this.unencodedTrack = null;
    this.track = null;
  }
}
