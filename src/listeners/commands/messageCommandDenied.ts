import {
  Events,
  Listener,
  type MessageCommandDeniedPayload,
  type UserError,
} from '@sapphire/framework';
import { silentTrackReply } from '../../lib/reply';

export class UserListener extends Listener<typeof Events.MessageCommandDenied> {
  public run(
    { message: content }: UserError,
    { message }: MessageCommandDeniedPayload
  ) {
    return silentTrackReply(message, content);
  }
}
