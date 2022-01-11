import { Client, Intents, Collection } from 'discord.js';

export class EmperorClient extends Client {
  public commands: Collection<unknown, unknown>;

  constructor(){
    super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES] });
    this.commands = new Collection();
  }
}
