import { ClientOptions } from 'discord.js';

export interface LoggerOptions {
  level: string;
}

export interface EmperorClientOptions extends ClientOptions {
  logger?: LoggerOptions;
}
