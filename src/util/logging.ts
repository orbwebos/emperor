import { format } from 'date-fns';
import chalk from 'chalk';
import { ConfigManager } from './config_manager'; const config = new ConfigManager();

function ownerReport(client: any, message: any): void {
  client.users.fetch(config.bot.owner_id)
  .then(owner => owner.send(`\`\`\`${message}\`\`\``))
  .catch(e => console.error(e));
}

function writeToLogChannel(client: any, message: any) {
  client.guilds.fetch(config.bot.logging_guild)
  .then(guild => guild.channels.fetch(config.bot.logging_channel))
  .then(channel => {
    if (channel.type === 'GUILD_TEXT') {
      // @ts-ignore: Property 'send' does not exist on type 'TextChannel'.
      return channel.send(`\`\`\`${message}\`\`\``);
    }
  })
  .catch(e => {
    console.error(e);
  });
}

const NOTIFY = 60;
const FATAL = 50;
const ERROR = 40;
const WARNING = 30;
const INFO = 20;
const DEBUG = 10;

function getDate(): {string: string, color: string} {
  const now = new Date();
  const dateStr = format(now, 'yyyy/MM/dd HH:mm:ss');
  return {string: dateStr, color: chalk.green(dateStr)};
}

function getLevel(level: 'NOTIFY' | 'FATAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'): {string: string, color: string} {
  switch (level) {
    case 'NOTIFY':
      return {string: level, color: chalk.bgGreen.black.bold(level)};
    case 'FATAL':
      return {string: level, color: chalk.red(level)};
    case 'ERROR':
      return {string: level, color: chalk.magenta(level)};
    case 'WARNING':
      return {string: level, color: chalk.yellow(level)};
    case 'INFO':
      return {string: level, color: chalk.blue(level)};
    case 'DEBUG':
      return {string: level, color: chalk.cyan(level)};
  }
}

export function notify(client: any, message: any): void {
  if (NOTIFY >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('NOTIFY');
    const messageString = `${date.string} ${level.string}: ${message}`

    process.stdout.write(`${date.color} ${level.color}: `);
    console.log(message);

    writeToLogChannel(client, messageString);
    ownerReport(client, messageString);
  }
}

export function fatal(client: any, message: any): void {
  if (FATAL >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('FATAL');
    const messageString = `${date.string} ${level.string}: ${message}`

    process.stderr.write(`${date.color} ${level.color}: `);
    console.error(message);

    writeToLogChannel(client, messageString);
    ownerReport(client, messageString);
  }
}

export function error(client: any, message: any): void {
  if (ERROR >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('ERROR');
    const messageString = `${date.string} ${level.string}: ${message}`

    process.stderr.write(`${date.color} ${level.color}: `);
    console.error(message);

    writeToLogChannel(client, messageString);
  }
}

export function warn(client: any, message: any): void {
  if (WARNING >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('WARNING');
    const messageString = `${date.string} ${level.string}: ${message}`

    process.stderr.write(`${date.color} ${level.color}: `);
    console.warn(message);

    writeToLogChannel(client, messageString);
  }
}

export function info(client: any, message: any): void {
  if (INFO >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('INFO');
    const messageString = `${date.string} ${level.string}: ${message}`

    process.stdout.write(`${date.color} ${level.color}: `);
    console.info(message);

    if (client !== 0) {
      writeToLogChannel(client, messageString);
    }
  }
}

export function debug(message: any): void {
  if (DEBUG >= config.bot.log_level) {
    const date = getDate();
    const level = getLevel('DEBUG');

    process.stdout.write(`${date.color} ${level.color}: `);
    console.debug(message);
  }
}
