/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
import {
  Client,
  Collection,
  ClientOptions,
  CommandInteraction,
} from 'discord.js';
import { EmojiStore } from './emoji_store';

export class EmperorClient extends Client {
  public emojiStore: EmojiStore;
  public commands: Collection<
    string,
    (interaction: CommandInteraction) => Promise<void>
  >;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.emojiStore = new EmojiStore();
  }

  setupCommands(path: fs.PathLike): void {
    const commandFiles = fs
      .readdirSync(path)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const cmd = require(`${path}/${file}`);
      this.commands.set(cmd.cmd.data.name, cmd.cmd.executer);
    }
  }

  setupEvents(path: fs.PathLike): void {
    const eventFiles = fs
      .readdirSync(path)
      .filter((file) => file.endsWith('.js'));

    eventFiles.forEach((file: string) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const Event = require(`${path}/${file}`).default;
      const data = new Event();

      if (data.once) {
        this.once(data.name, (...args) => Event.execute(...args, this));
      } else {
        this.on(data.name, (...args) => Event.execute(...args, this));
      }
    });
  }

  public async login(token?: string): Promise<string> {
    const returned = await super.login(token);

    return returned;
  }
}
