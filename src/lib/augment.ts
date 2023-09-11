import { type GuildChannel, type PermissionResolvable } from 'discord.js';

declare module 'discord.js' {
  interface Client {
    hasPermission(
      channel: GuildChannel,
      permission: PermissionResolvable
    ): boolean;

    missingPermissions(
      channel: GuildChannel,
      ...permissions: PermissionResolvable[]
    ): PermissionResolvable[];
  }
}
