import { GuildChannel, GuildMember, PermissionResolvable } from 'discord.js';

export function memberHasChannelPermission(
  member: GuildMember,
  channel: GuildChannel,
  permission: PermissionResolvable
): boolean {
  return channel.permissionsFor(member).has(permission);
}

export function formatPermissions(permissions: PermissionResolvable[]): string {
  let str = '';

  // eslint-disable-next-line no-restricted-syntax
  for (const [i, permission] of permissions.entries()) {
    str += `\`${permission}\``;
    if (i < permissions.length) {
      str += ',';
    }
  }

  return str;
}
