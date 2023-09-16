import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { silentTrackReply, silentTrackReplyMusicEmbed } from '../../lib/reply';
import { variants } from '../../lib/variants';

@ApplyOptions<Command.Options>({
  aliases: variants('force skip', 'f skip', 'skip f'),
  description: `Skips a specified amount of songs (by default, the current one)`,
  preconditions: ['GuildHasPlayer'],
})
export class UserCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const { music, player } = this.container.getMusic(message.guildId);

    const amount = (await args.pickResult('integer')).unwrapOr(1);
    if (amount < 1) {
      return silentTrackReply(message, "You can't skip less than one track.");
    }

    const { next, skipped } = music.queueSkip(message.guildId, amount, true);
    if (!next) {
      await player.stop();
      if (!skipped.length) {
        return silentTrackReply(message, 'There are no tracks to skip.');
      }
      const plural = skipped.length === 1 ? '' : 's';
      return silentTrackReply(
        message,
        `Forcefully skipped ${skipped.length} track${plural}.`
      );
    }
    await player.play({ track: next });

    return silentTrackReplyMusicEmbed(message, { track: next });
  }
}
