import { UserError } from '@sapphire/framework';

export class UserNotInVoiceChannelError extends UserError {
  public constructor() {
    super({
      identifier: 'USER_NOT_IN_VOICE_CHANNEL',
      message: 'expected user in voice channel',
    });
  }
}
