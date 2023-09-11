import {
  ChatInputCommandDeniedPayload,
  Events,
  Listener,
  UserError,
} from '@sapphire/framework';

export class UserListener extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  public async run(
    { message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ) {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(content);
    }
    return interaction.reply(content);
  }
}
