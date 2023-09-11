import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { registerSwitch } from '../../lib/util';
import {
  replyMusicEmbed,
  silentTrackReply,
  silentTrackReplyMusicEmbed,
} from '../../lib/reply';
import { EmperorTrack } from '../../lib/music/EmperorTrack';

@ApplyOptions<Command.Options>({
  description: `Skips a specified amount of songs (by default, the current one)`,
  flags: ['force', 'f'],
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((option) =>
            option
              .setName('amount')
              .setDescription('How many tracks to skip')
              .setMinValue(1)
          )
          .addBooleanOption((option) =>
            option
              .setName('force')
              .setDescription(
                'Whether to forcefully skip the track even if the queue is empty'
              )
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235151784771716'],
        },
        production: {
          idHints: ['1129238279217221764'],
        },
      })
    );
  }

  private replyEmbed(
    obj: Command.ChatInputCommandInteraction | Message,
    track: EmperorTrack
  ) {
    if (obj instanceof Message) {
      return silentTrackReplyMusicEmbed(obj, {
        track,
        title: 'Skipped to:',
      });
    }

    return replyMusicEmbed(obj, { track, title: 'Skipped to:' });
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { music, player } = this.container.getMusic(interaction.guildId);

    const amount = interaction.options.getInteger('amount') ?? 1;
    const force = interaction.options.getBoolean('force') ?? false;

    const { next, skipped, success } = music.queueSkip(
      interaction.guildId,
      amount,
      force
    );
    if (!success && !force) {
      return interaction.reply('No tracks were skipped: the queue is empty.');
    }
    if (!success && force) {
      return interaction.reply(
        'No tracks were skipped: the queue is empty and no track is playing.'
      );
    }

    if (!next) {
      await player.stop();
      const plural = skipped.length === 1 ? '' : 's';
      return interaction.reply(
        `Forcefully skipped ${skipped.length} track${plural}.`
      );
    }
    await player.play({ track: next });

    return this.replyEmbed(interaction, next);
  }

  public async messageRun(message: Message, args: Args) {
    const { music, player } = this.container.getMusic(message.guildId);

    const amount = (await args.pickResult('integer')).unwrapOr(1);
    if (amount < 1) {
      return silentTrackReply(message, "You can't skip less than one track.");
    }
    const force = args.getFlags('force', 'f');

    const { next, skipped, success } = music.queueSkip(
      message.guildId,
      amount,
      force
    );
    if (!success && !force) {
      return silentTrackReply(
        message,
        'No tracks were skipped: the queue is empty.'
      );
    }
    if (!success && force) {
      return silentTrackReply(
        message,
        'No tracks were skipped: the queue is empty and no track is playing.'
      );
    }

    if (!next) {
      await player.stop();
      const plural = skipped.length === 1 ? '' : 's';
      return silentTrackReply(
        message,
        `Forcefully skipped ${skipped.length} track${plural}.`
      );
    }
    await player.play({ track: next });

    return this.replyEmbed(message, next);
  }
}
