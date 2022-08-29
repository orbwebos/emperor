import {
  Logger,
  LoggerOptions,
  LogLevel,
  logLevelToNumber,
  logLevelToString,
} from 'imperial-discord';
import Pino, { LogFn as PinoLogFn } from 'pino';
import type { Logger as PinoLogger } from 'pino';

export class EmperorLogger implements Logger {
  public readonly internal: PinoLogger;
  public readonly level: LogLevel;

  public constructor(options: LoggerOptions) {
    this.level = this.level ? logLevelToNumber(options.level) : LogLevel.Info;

    this.internal = Pino({
      name: options.name ? options.name : 'Imperial',
      level: logLevelToString(this.level),
    });
  }

  public fatal(...values: readonly unknown[]): void {
    this.write(this.internal.fatal, ...values);
  }

  public error(...values: readonly unknown[]): void {
    this.write(this.internal.error, ...values);
  }

  public warn(...values: readonly unknown[]): void {
    this.write(this.internal.warn, ...values);
  }

  public info(...values: readonly unknown[]): void {
    this.write(this.internal.info, ...values);
  }

  public debug(...values: readonly unknown[]): void {
    this.write(this.internal.debug, ...values);
  }

  public trace(...values: readonly unknown[]): void {
    this.write(this.internal.trace, ...values);
  }

  private write(fn: PinoLogFn, ...values: readonly unknown[]): void {
    const obj = values.length > 0 ? (values[0] as object) : null;
    const msg = values.length > 1 ? (values[1] as string) : null;
    const rest = values.length > 2 ? values.slice(values.length - 2) : null;

    if (msg === null) {
      fn.bind(this.internal)(obj);
    } else if (rest === null) {
      fn.bind(this.internal)(obj, msg);
    } else {
      fn.bind(this.internal)(obj, msg, ...rest);
    }
  }
}
