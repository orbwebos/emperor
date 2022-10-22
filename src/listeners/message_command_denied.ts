import { ApplyOptions } from '@sapphire/decorators';
import {
  Listener,
  MessageCommandDeniedPayload,
  UserError,
} from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  event: 'messageCommandDenied',
})
export class MessageCommandDeniedListener extends Listener {
  public async run(error: UserError, { message }: MessageCommandDeniedPayload) {
    return message.reply(error.message);
  }
}
