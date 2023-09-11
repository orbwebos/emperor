import {
  ClientLoggerOptions,
  LogLevel,
  SapphireClient,
} from '@sapphire/framework';
import { ClientOptions, GuildChannel, PermissionResolvable } from 'discord.js';
import { envSwitch } from './util';
import { memberHasChannelPermission } from './permissions';

const CLIENT_OPTIONS: ClientOptions = {
  defaultPrefix: envSwitch({
    development: ['[', 'Emperor ', 'emperor ', 'Emperor, ', 'emperor, '],
    testing: [']', 'Emperor ', 'emperor ', 'Emperor, ', 'emperor, '],
    production: ['.', 'Emperor ', 'emperor ', 'Emperor, ', 'emperor, '],
  }),
  loadMessageCommandListeners: true,
  intents: [
    'Guilds',
    'MessageContent',
    'GuildMessages',
    'GuildMessageReactions',
    'GuildVoiceStates',
    'DirectMessages',
  ],
  logger: envSwitch<ClientLoggerOptions>({
    development: { level: LogLevel.Debug },
    production: { level: LogLevel.Info },
  }),
};

export class EmperorClient extends SapphireClient {
  public constructor() {
    super(CLIENT_OPTIONS);
  }

  public hasPermission(
    channel: GuildChannel,
    permission: PermissionResolvable
  ): boolean {
    return memberHasChannelPermission(
      channel.guild.members.cache.get(this.id),
      channel,
      permission
    );
  }

  public missingPermissions(
    channel: GuildChannel,
    ...permissions: PermissionResolvable[]
  ): PermissionResolvable[] {
    return permissions.filter(
      (permission) => !this.hasPermission(channel, permission)
    );
  }
}
