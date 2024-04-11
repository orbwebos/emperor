import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { variants } from '../../lib/variants';
import { silentReply } from '../../lib/reply';

const musicCommandNames = variants(
  'fast forward',
  'forward',
  'ff',
  'ffw',
  'fwd',
  'fw',
  'force play',
  'play force',
  'f play',
  'play f',
  'force skip',
  'f skip',
  'skip f',
  'nightcore',
  'now playing',
  'playing',
  'pause',
  'resume',
  'play',
  'play file',
  'queue',
  'q',
  'replay',
  'rewind',
  'rew',
  'rwd',
  'rw',
  'seek',
  'skip',
  'stop',
  'volume'
);

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate })
export class UserListener extends Listener<typeof Events.MessageCreate> {
  private async triggered(message: Message): Promise<boolean> {
    if (message.author.bot) {
      return false;
    }

    const prefix = (await this.container.client.fetchPrefix(message))[0];

    if (message?.content[0] !== prefix) {
      return false;
    }

    return musicCommandNames.includes(
      message.content.substring(prefix.length).toLowerCase()
    );
  }

  public async run(message: Message) {
    if (!(await this.triggered(message))) {
      return;
    }
    silentReply(
      message,
      "Music commands have been temporarily removed in the 5.21.0 release due to long-standing issues. They'll be brought back in the 5.22.0 release."
    );
  }
}
