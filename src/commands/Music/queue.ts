import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, Message } from 'discord.js';
import { Track } from 'shoukaku';
import { Args } from '@sapphire/framework';
import { defaultEmperorEmbed } from '../../lib/embeds';
import {
  replyEmbed,
  silentTrackReply,
  silentTrackReplyEmbed,
} from '../../lib/reply';
import { format } from '../../lib/music/MusicManager';
import { registerSwitch } from '../../lib/util';
import { RepeatingMode } from '../../lib/music/TrackQueue';

@ApplyOptions<Subcommand.Options>({
  name: 'queue',
  description: 'Various commands to manage the music queue',
  aliases: ['q'],
  preconditions: ['GuildHasPlayer'],
  subcommands: [
    {
      name: 'list',
      messageRun: 'messageList',
      default: true,
      chatInputRun: 'chatInputList',
    },
    {
      name: 'view',
      messageRun: 'messageList',
    },
    {
      name: 'clear',
      messageRun: 'messageClear',
      chatInputRun: 'chatInputClear',
    },
    {
      name: 'remove',
      messageRun: 'messageRemove',
      chatInputRun: 'chatInputRemove',
    },
    {
      name: 'shuffle',
      messageRun: 'messageShuffle',
      chatInputRun: 'chatInputShuffle',
    },
    {
      name: 'loop',
      messageRun: 'messageLoop',
      chatInputRun: 'chatInputLoop',
    },
  ],
})
export class UserCommand extends Subcommand {
  public registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('queue')
          .setDescription('Queue commands')
          .addSubcommand((command) =>
            command.setName('list').setDescription('Displays the music queue')
          )
          .addSubcommand((command) =>
            command.setName('clear').setDescription('Clears the music queue')
          )
          .addSubcommand((command) =>
            command
              .setName('remove')
              .setDescription('Removes a track from the music queue')
              .addNumberOption((option) =>
                option
                  .setName('track')
                  .setDescription('The number of the track to remove')
                  .setRequired(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName('shuffle')
              .setDescription('Shuffles the music queue')
          )
          .addSubcommand((command) =>
            command
              .setName('loop')
              .setDescription("Changes the queue's looping mode")
              .addStringOption((option) =>
                option
                  .setName('mode')
                  .setDescription('The repeating mode to set the queue to')
                  .addChoices(
                    { name: 'Off', value: 'none' },
                    { name: 'Song', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                  )
                  .setRequired(true)
              )
          ),
      registerSwitch({
        development: {
          guildIds: ['948971692804419705'],
          idHints: ['1129235153663828039'],
        },
        production: {
          idHints: ['1129238358468603994'],
        },
      })
    );
  }

  public async chatInputList(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { music } = this.container;
    const queue = music.queueGet(interaction.guildId);

    if (!queue) {
      return interaction.reply('No queue in server.');
    }
    if (queue.length <= 0) {
      return interaction.reply('Queue is empty.');
    }

    return replyEmbed(interaction, UserCommand.queueEmbed(queue));
  }

  public async messageList(message: Message) {
    const { music } = this.container;
    const queue = music.queueGet(message.guildId);

    if (!queue) {
      return silentTrackReply(message, 'No queue in server.');
    }
    if (queue.length <= 0) {
      return silentTrackReply(message, 'Queue is empty.');
    }

    return silentTrackReplyEmbed(message, UserCommand.queueEmbed(queue));
  }

  private static queueEmbed(queue: Track[]): EmbedBuilder {
    let s = '';
    let truncated = false;
    let reached = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const [i, track] of queue.entries()) {
      const toAdd = `**${i + 1}**. **[${track.info.title}](${
        track.info.uri
      })** (${format(track.info.length)})\n${
        track.info.author ?? 'Unknown artist'
      }\n`;

      if ((s + toAdd).length > 4096) {
        truncated = true;
        break;
      }

      s += toAdd;
      reached += 1;
    }

    if (truncated) {
      const plural = reached === 1 ? '' : 's';
      return defaultEmperorEmbed()
        .setTitle(`Showing first ${reached} track${plural} of ${queue.length}`)
        .setDescription(s)
        .setFooter({
          text: `Sorry, but the queue is so long that Emperor can't show all of it—this limitation will be fixed in the future. For now, here are the first ${reached} track${plural} of the queue.`,
        });
    }

    const plural = queue.length === 1 ? '' : 's';
    return defaultEmperorEmbed()
      .setTitle(`Showing ${queue.length} track${plural}`)
      .setDescription(s);
  }

  public async chatInputClear(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { music } = this.container;

    music.queueClear(interaction.guildId);

    return interaction.reply('Queue cleared.');
  }

  public async messageClear(message: Message) {
    const { music } = this.container;

    music.queueClear(message.guildId);

    return silentTrackReply(message, 'Queue cleared.');
  }

  public async chatInputRemove(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { music } = this.container;

    const index = interaction.options.getNumber('track');

    music.queueRemove(interaction.guildId, index - 1);

    return interaction.reply('Removed from queue.');
  }

  public async messageRemove(message: Message, args: Args) {
    const { music } = this.container;

    const index = await args.pick('integer');

    music.queueRemove(message.guildId, index - 1);

    return silentTrackReply(message, 'Removed from queue.');
  }

  public async chatInputShuffle(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { music } = this.container;

    const ok = music.queueShuffle(interaction.guildId);
    if (!ok) {
      return interaction.reply(
        "This server doesn't have a queue, or it doesn't have enough tracks to shuffle."
      );
    }

    return interaction.reply('Shuffled the queue.');
  }

  public async messageShuffle(message: Message) {
    const { music } = this.container;

    const ok = music.queueShuffle(message.guildId);
    if (!ok) {
      return silentTrackReply(
        message,
        "This server doesn't have a queue, or it doesn't have enough tracks to shuffle."
      );
    }

    return silentTrackReply(message, 'Shuffled the queue.');
  }

  public async chatInputLoop(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { music } = this.container;

    const current = music.queueMode(interaction.guildId);
    if (!current) {
      return interaction.reply('No queue in server.');
    }

    const mode = interaction.options.getString('mode') as RepeatingMode;

    const oldMode = music.queueModeSet(interaction.guildId, mode);
    if (!oldMode) {
      return interaction.reply('No queue in server.');
    }

    if (oldMode === mode) {
      return interaction.reply(
        'The queue repeating mode is already set to that.'
      );
    }

    return interaction.reply(`Queue repeating mode set to \`${mode}\`.`);
  }

  public async messageLoop(message: Message, args: Args) {
    const { music } = this.container;

    const current = music.queueMode(message.guildId);
    if (!current) {
      return silentTrackReply(message, 'No queue in server.');
    }

    const mode = await args.pick('repeatingMode');

    const oldMode = music.queueModeSet(message.guildId, mode);
    if (!oldMode) {
      return silentTrackReply(message, 'No queue in server.');
    }

    if (oldMode === mode) {
      return silentTrackReply(
        message,
        'The queue repeating mode is already set to that.'
      );
    }

    return silentTrackReply(
      message,
      `Queue repeating mode set to \`${mode}\`.`
    );
  }
}
