import {
  ApplicationCommandRegistries,
  ClientLoggerOptions,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
  container,
} from '@sapphire/framework';
import { GuildChannel, PermissionResolvable } from 'discord.js';
import { envSwitch } from './util';
import { memberHasChannelPermission } from './permissions';
import { EmperorLogger } from './EmperorLogger';

export class EmperorClient extends SapphireClient {
  public constructor() {
    super({
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
        development: {
          instance: new EmperorLogger({
            level: LogLevel.Debug,
            channelId: container.config.bot.loggingChannelId,
            webhookName: `${container.config.bot.name} Logs`,
            webhookErrorIconUrl:
              container.config.general.loggingWebhookErrorIconUrl,
            webhookFatalIconUrl:
              container.config.general.loggingWebhookFatalIconUrl,
          }),
        },
        production: {
          instance: new EmperorLogger({
            level: LogLevel.Info,
            channelId: container.config.bot.loggingChannelId,
            webhookName: `${container.config.bot.name} Logs`,
            webhookErrorIconUrl:
              container.config.general.loggingWebhookErrorIconUrl,
            webhookFatalIconUrl:
              container.config.general.loggingWebhookFatalIconUrl,
          }),
        },
      }),
    });
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.BulkOverwrite
    );
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
