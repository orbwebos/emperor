import { Events, Listener, ListenerErrorPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.ListenerError> {
  public run(error: any, payload: ListenerErrorPayload) {
    return this.container.logger.warn(
      `Listener error: ${error}, happened in ${payload.piece.name}`
    );
  }
}
