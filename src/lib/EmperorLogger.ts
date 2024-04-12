import { LogLevel, container } from '@sapphire/framework';
import { Logger, LoggerOptions } from '@sapphire/plugin-logger';
import {
  ColorResolvable,
  EmbedBuilder,
  TextChannel,
  Webhook,
  WebhookMessageCreateOptions,
} from 'discord.js';
import { truncateString } from './util';

export class EmperorLogger extends Logger {
  private readonly channelId: string;
  private readonly webhookName: string;
  private readonly webhookErrorIconUrl: string;
  private readonly webhookFatalIconUrl: string;

  public constructor(
    options: LoggerOptions & {
      channelId: string;
      webhookName: string;
      webhookErrorIconUrl: string;
      webhookFatalIconUrl: string;
    }
  ) {
    super(options);
    this.channelId = options.channelId;
    this.webhookName = options.webhookName;
    this.webhookErrorIconUrl = options.webhookErrorIconUrl;
    this.webhookFatalIconUrl = options.webhookFatalIconUrl;
  }

  private async logWebhook(
    level: LogLevel,
    values: readonly unknown[]
  ): Promise<void> {
    const formattedMessage = `\`\`\`${this.formatMessage(values)}\`\`\``;
    const webhook = await this.getWebhook();
    const content = truncateString(formattedMessage, 4000);
    const embed = new EmbedBuilder()
      .setTitle(this.formatLogLevel(level))
      .setDescription(content)
      .setColor(this.colorForLogLevel(level))
      .setTimestamp();
    const send: WebhookMessageCreateOptions = {
      username: `${this.formatLogLevel(level)} Log`,
      embeds: [embed],
    };
    switch (level) {
      case LogLevel.Error:
        send.avatarURL = this.webhookErrorIconUrl;
        break;
      case LogLevel.Fatal:
        send.avatarURL = this.webhookFatalIconUrl;
        break;
      default:
      // do nothing
    }
    await webhook.send(send);
  }

  private async getWebhook(): Promise<Webhook> {
    const channel = (await container.client.channels.fetch(
      this.channelId
    )) as TextChannel;
    const webhooks = await channel.fetchWebhooks();

    let webhook = webhooks.find((w) => w.name === this.webhookName);
    if (!webhook) {
      this.debug(
        `Creating new ${this.webhookName} webhook in ${this.channelId}...`
      );
      webhook = await channel.createWebhook({
        name: this.webhookName,
        avatar: container.config.general.loggingWebhookAvatarUrl,
      });
    }

    return webhook;
  }

  private colorForLogLevel(level: LogLevel): ColorResolvable {
    switch (level) {
      case LogLevel.Error:
        return container.config.general.loggingChannelErrorColor;
      case LogLevel.Fatal:
        return container.config.general.loggingChannelFatalColor;
      default:
        return container.config.bot.defaultColor;
    }
  }

  private formatLogLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.None:
        return 'None';
      case LogLevel.Trace:
        return 'Trace';
      case LogLevel.Debug:
        return 'Debug';
      case LogLevel.Info:
        return 'Info';
      case LogLevel.Warn:
        return 'Warn';
      case LogLevel.Error:
        return 'Error';
      case LogLevel.Fatal:
        return 'Fatal';
      default:
        throw new Error(`illegal state: invalid log level passed: ${level}`);
    }
  }

  private formatMessage(values: readonly unknown[]): string {
    return values
      .map((value) => {
        if (typeof value === 'object') {
          // attempt to convert object to string using JSON.stringify
          // catch any errors (like circular references) and use toString() as fallback
          try {
            return JSON.stringify(value);
          } catch (error) {
            return value.toString();
          }
        }
        // convert non-objects directly to string
        return String(value);
      })
      .join(' ');
  }

  public override error(...values: readonly unknown[]): void {
    super.error(...values);
    this.logWebhook(LogLevel.Error, values).catch((error) =>
      super.error('Failed to log via webhook:', error)
    );
  }

  public override fatal(...values: readonly unknown[]): void {
    super.fatal(...values);
    this.logWebhook(LogLevel.Fatal, values).catch((error) =>
      super.error('Failed to log via webhook:', error)
    );
  }
}
