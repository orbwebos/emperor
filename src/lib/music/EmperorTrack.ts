import { GuildMember } from 'discord.js';
import { Track } from 'shoukaku';

export interface EmperorTrack extends Track {
  requester: GuildMember;
}
