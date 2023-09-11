import { Argument } from '@sapphire/framework';
import { RepeatingMode } from '../lib/music/TrackQueue';

export class RepeatingModeArgument extends Argument<RepeatingMode> {
  public run(parameter: string, context: Argument.Context) {
    switch (parameter.toLowerCase()) {
      case 'no':
      case 'n':
      case 'none':
      case 'negative':
      case 'false':
      case 'f':
      case '0':
      case 'disable':
      case 'off':
        return this.ok(RepeatingMode.NONE);
      case 'song':
      case 's':
      case 'track':
      case 'current':
      case '2':
        return this.ok(RepeatingMode.TRACK);
      case 'queue':
      case 'q':
      case 'yes':
      case 'y':
      case 'true':
      case 't':
      case '1':
      case 'enable':
      case 'on':
      case 'all':
        return this.ok(RepeatingMode.QUEUE);
      default:
        return this.error({
          context,
          parameter,
          message:
            'The provided argument could not be parsed as a queue repeating mode.',
          identifier: 'ArgumentNotARepeatingMode',
        });
    }
  }
}

declare module '@sapphire/framework' {
  interface ArgType {
    repeatingMode: RepeatingMode;
  }
}
