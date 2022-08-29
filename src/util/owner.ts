import { config } from './config_manager';
import { isInArray } from './is_in';

export function isOwnerId(id: string): boolean {
  return isInArray(config.bot.ownerIds, id);
}
