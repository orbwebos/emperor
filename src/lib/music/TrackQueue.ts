import { EmperorTrack } from './EmperorTrack';
import { shuffleInPlace } from '../util';

export enum RepeatingMode {
  NONE = 'none',
  TRACK = 'track',
  QUEUE = 'queue',
}

export interface SkipResult {
  next: EmperorTrack | null;
  skipped: EmperorTrack[];
  success: boolean;
}

export class TrackQueue {
  public tracks: EmperorTrack[];
  public mode: RepeatingMode = RepeatingMode.NONE;

  public constructor() {
    this.tracks = [];
  }

  public getAll(): EmperorTrack[] {
    return [...this.tracks];
  }

  public clear(): EmperorTrack[] {
    const { tracks } = this;
    this.tracks = [];
    return tracks;
  }

  public add(element: EmperorTrack[]): void {
    this.tracks.push(...element);
  }

  public dequeue(): EmperorTrack | undefined {
    if (this.tracks.length === 0) {
      return undefined;
    }
    return this.tracks.shift();
  }

  public isEmpty(): boolean {
    return this.tracks.length === 0;
  }

  public size(): number {
    return this.tracks.length;
  }

  public shuffle(): void {
    return shuffleInPlace(this.tracks);
  }

  public remove(index: number): EmperorTrack | undefined {
    if (this.tracks.length <= index) {
      return undefined;
    }
    return this.tracks.splice(index, 1)[0];
  }

  public skip(current: EmperorTrack | null, amountToSkip: number): SkipResult {
    const combinedQueue: EmperorTrack[] = current
      ? [current, ...this.tracks]
      : [...this.tracks];

    if ((combinedQueue.length === 1 && current) || amountToSkip < 1) {
      return {
        next: current,
        skipped: [],
        success: false,
      };
    }

    let effectiveAmount = amountToSkip;
    if (effectiveAmount >= combinedQueue.length) {
      if (this.mode === RepeatingMode.QUEUE) {
        effectiveAmount %= combinedQueue.length;
        if (effectiveAmount === 0) {
          const next = combinedQueue[combinedQueue.length - 1];
          return {
            next,
            skipped: combinedQueue,
            success: true,
          };
        }
      } else {
        const skipped = combinedQueue;
        this.tracks = [];
        return {
          next: skipped[skipped.length - 1],
          skipped,
          success: true,
        };
      }
    }

    const skipped = combinedQueue.slice(0, effectiveAmount);
    const remaining = combinedQueue.slice(effectiveAmount);
    const next = remaining.shift(); // Remove the next track from the elements

    this.tracks =
      this.mode === RepeatingMode.QUEUE
        ? [...remaining, ...skipped]
        : [...remaining];

    return {
      next,
      skipped,
      success: true,
    };
  }

  forceSkip(current: EmperorTrack | null, amountToSkip: number): SkipResult {
    const combinedQueue: EmperorTrack[] = current
      ? [current, ...this.tracks]
      : [...this.tracks];

    let effectiveAmount = amountToSkip;
    if (effectiveAmount >= combinedQueue.length) {
      if (this.mode === RepeatingMode.QUEUE) {
        effectiveAmount %= combinedQueue.length;
      } else {
        this.tracks = [];
        return {
          next: null,
          skipped: combinedQueue,
          success: true,
        };
      }
    }

    const skipped = combinedQueue.slice(0, effectiveAmount);
    const remaining = combinedQueue.slice(effectiveAmount);
    const next = remaining.shift(); // Remove the next track from the elements

    this.tracks =
      this.mode === RepeatingMode.QUEUE
        ? [...remaining, ...skipped]
        : [...remaining];

    return {
      next: next || null,
      skipped,
      success: true,
    };
  }
}
