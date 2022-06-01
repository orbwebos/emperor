import Pino from 'pino';
import { ConfigManager } from '../util/config_manager';

const { bot } = new ConfigManager();

export const logger = Pino({ name: bot.name, level: bot.log_level });
