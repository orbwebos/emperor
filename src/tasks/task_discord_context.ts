import { MessageActionRow, MessageButton } from 'discord.js';
import { Replier, Retorter } from '../util/sender_replier';
import { BaseTaskUser } from './base_task_user';
import { EmperorTitle } from '../emperor/title';
import * as log from '../util/logging';
import { resolveTimeZone } from './helpers';
import { Task } from './task';
import { TaskDiscordHelper } from './task_discord_helper';
import { contexts } from './contexts';
import { TaskQuickSort } from './task_sort';
import { TaskSearchOptions } from './interfaces';
import { TaskStatus } from './statuses';
import { ConfigManager } from '../util/config_manager';

class TaskDiscordContext {
  public readonly title: EmperorTitle;
  private replier: Replier;
  private readonly initialInteraction: any;
  private readonly baseTaskUser: BaseTaskUser;
  private taskDiscordHelper: TaskDiscordHelper;
  private initialized: boolean;
  private retorter: Retorter;
  private readonly depherEphemerally: boolean;

  constructor(replier: Replier, depherEphemerally?: boolean) {
    if (depherEphemerally === undefined) {
      this.depherEphemerally = true;
    } else {
      this.depherEphemerally = depherEphemerally;
    }

    if (replier.interaction.replied) {
      throw new Error(
        "Error in creating task setup context: replier's interaction has already been replied."
      );
    }

    this.replier = replier;
    this.baseTaskUser = new BaseTaskUser(replier.interaction.user.id);
    this.title = new EmperorTitle(replier.interaction);
    this.initialInteraction = replier.interaction;
  }

  private async ensureUserIsRegistered(): Promise<{
    replier: Replier;
    canEditOriginal: boolean;
    message: string;
  }> {
    if (this.baseTaskUser.isRegistered()) {
      return {
        replier: this.replier,
        canEditOriginal: true,
        message: 'WAS_REGISTERED',
      };
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('registration-declined')
        .setLabel('Cancel')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId('registration-accepted')
        .setLabel('Sign up')
        .setStyle('PRIMARY')
    );

    const row2 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('timezone-prompt-cancelled')
        .setLabel('Cancel')
        .setStyle('SECONDARY')
    );

    const row3 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('timezone-cancelled')
        .setLabel('Cancel')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId('timezone-confirmed')
        .setLabel('Yes')
        .setStyle('PRIMARY')
    );

    const buttonFilter = (i) =>
      i.customId === 'registration-declined' ||
      (i.customId === 'registration-accepted' &&
        i.user.id === this.replier.interaction.user.id);
    const buttonFilter2 = (i) =>
      i.customId === 'timezone-prompt-cancelled' &&
      i.user.id == this.replier.interaction.user.id;
    const buttonFilter3 = (i) =>
      i.customId === 'timezone-cancelled' ||
      (i.customId === 'timezone-confirmed' &&
        i.user.id === this.replier.interaction.user.id);
    const collector =
      await this.replier.interaction.channel.createMessageComponentCollector({
        buttonFilter,
        time: 300000,
      });

    await this.replier.editReplyWithComponent(
      this.title.choice,
      'This seems to be your first time using the Tasks module. Do you wish to sign up now?',
      row
    );

    return new Promise((resolve, reject) => {
      try {
        collector.once('collect', async (i) => {
          await collector.stop();
          const embedCancelled = this.replier.emperorEmbed(
            this.title.cancelled,
            'You have cancelled the sign-up process.',
            this.replier.color
          );
          if (i.customId === 'registration-accepted') {
            const embedTop = this.replier.emperorEmbed(
              this.title.prompt,
              `Please, send your time zone in IANA format. If ${
                new ConfigManager().bot.name
              } has the necessary permissions, your message will be deleted as soon as it is received.\n[Click here to see the list of time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).\n\nAn example of a valid response: **America/New_York**.`,
              this.replier.color
            );

            const messageFilter = (m) =>
              this.replier.interaction.user.id === m.author.id;
            const messageCollector =
              this.replier.interaction.channel.createMessageCollector({
                messageFilter,
                time: 300000,
              });

            await i.update({ embeds: [embedTop], components: [row2] });

            messageCollector.once('collect', async (j) => {
              await messageCollector.stop();
              await i.editReply({ embeds: [embedTop], components: [] });
              try {
                await j.delete();
              } catch (e) {
                log.debug(`Couldn't delete message ${j.id}: ${e}.`);
              }
              const collector3 =
                await this.replier.interaction.channel.createMessageComponentCollector(
                  { buttonFilter3, time: 300000 }
                );
              let tz: string = '';
              try {
                tz = resolveTimeZone(j.content);
              } catch (e) {
                const tzErrorReplier = new Replier(i, this.replier.color);
                resolve({
                  replier: tzErrorReplier,
                  canEditOriginal: false,
                  message: 'TIMEZONE_HAS_NO_MATCHES',
                });
              }
              const embedBottom = this.replier.emperorEmbed(
                this.title.choice,
                `Your time zone is: **${tz}**, is this correct?`,
                this.replier.color
              );
              await i.followUp({
                embeds: [embedBottom],
                ephemeral: true,
                components: [row3],
              });
              collector3.once('collect', async (k) => {
                await collector3.stop();
                if (k.customId === 'timezone-confirmed') {
                  const replier = new Replier(k, this.replier.color);
                  try {
                    await this.baseTaskUser.register(tz);
                  } catch (e) {
                    log.error(this.replier.interaction.client, e);
                    resolve({
                      replier,
                      canEditOriginal: false,
                      message: 'USER_REGISTRATION_ERROR',
                    });
                  }

                  const embed = this.replier.emperorEmbed(
                    this.title.response,
                    'You have successfully signed up.',
                    this.replier.color
                  );
                  await k.update({ embeds: [embed], components: [] });
                  resolve({
                    replier,
                    canEditOriginal: false,
                    message: 'REGISTERED',
                  });
                } else if (k.customId === 'timezone-cancelled') {
                  await k.update({
                    embeds: [embedCancelled],
                    components: [],
                  });
                  const replier = new Replier(k, this.replier.color);
                  resolve({
                    replier,
                    canEditOriginal: false,
                    message: 'CANCELLED_ON_TIMEZONE_CONFIRMATION',
                  });
                }
              });
            });

            const collector2 =
              await this.replier.interaction.channel.createMessageComponentCollector(
                { buttonFilter2, time: 300000 }
              );
            collector2.once('collect', async (j) => {
              await collector2.stop();
              if (j.customId === 'timezone-prompt-cancelled') {
                await messageCollector.stop();
                await j.update({ embeds: [embedCancelled], components: [] });
                const replier = new Replier(j, this.replier.color);
                resolve({
                  replier,
                  canEditOriginal: false,
                  message: 'CANCELLED_ON_TIMEZONE_PROMPT',
                });
              }
            });
          } else if (i.customId === 'registration-declined') {
            await i.update({ embeds: [embedCancelled], components: [] });
            const replier = new Replier(i, this.replier.color);
            resolve({
              replier,
              canEditOriginal: false,
              message: 'CANCELLED_ON_FIRST',
            });
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private async registrationPipeline(): Promise<{
    replier: Replier;
    canEditOriginal: boolean;
    message: string;
  }> {
    const resp = await this.ensureUserIsRegistered();
    this.replier = resp.replier;
    switch (resp.message) {
      case 'TIMEZONE_HAS_NO_MATCHES': {
        const e = new Error('user-provided timezone had no matches');
        e.name = 'InputError';
        throw e;
      }
      case 'USER_REGISTRATION_ERROR': {
        const e = new Error('there was an error during user registration');
        e.name = 'GenericError';
        throw e;
      }
    }

    return resp;
  }

  public async addTaskFromContext(): Promise<Task> {
    return this.taskDiscordHelper.addTaskFromInteraction(
      this.initialInteraction
    );
  }

  public async searchFromContext(): Promise<Task[]> {
    return this.taskDiscordHelper.searchFromInteraction(
      this.initialInteraction
    );
  }

  public async searchFromOptions(options: TaskSearchOptions): Promise<Task[]> {
    return this.taskDiscordHelper.search(options);
  }

  public async editFromContext(): Promise<{ original: Task; modified: Task }> {
    return this.taskDiscordHelper.editFromInteraction(this.initialInteraction);
  }

  public async removeFromContext(): Promise<{
    trashed: Task[];
    removed: Task[];
  }> {
    return this.taskDiscordHelper.removeFromInteraction(
      this.initialInteraction
    );
  }

  public async changeStatusFromContext(): Promise<{
    tasks: Task[];
    status: TaskStatus;
  }> {
    return this.taskDiscordHelper.changeStatusFromInteraction(
      this.initialInteraction
    );
  }

  public async editUserConfigFromContext(): Promise<{
    map: Map<string, { original: string; modified: string }>;
    optionsPassed: boolean;
  }> {
    return this.taskDiscordHelper.editUserConfigFromInteraction(
      this.initialInteraction
    );
  }

  private shortFormatForCourse(tasks: Task[], taskSeparator: string): string {
    if (tasks.length) {
      let toReturn: string = '';
      for (const i in tasks) {
        const t = tasks[i];

        if (parseInt(i) === 0) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        }

        if (t.trash.isIn) {
          toReturn += '🗑 ';
        }

        if (t.priority === 1) {
          toReturn += '‼ ';
        } else if (t.priority === 2) {
          toReturn += '❗ ';
        }

        if (t.dates.deadline.reminder) {
          toReturn += '🔔 ';
        } else {
          toReturn += '🔕 ';
        }

        if (t.late) {
          toReturn += '🕓 ';
        }

        if (t.dormant) {
          toReturn += '💤 ';
        }

        toReturn += `**${t.title}** `;
        toReturn += `${this.taskDiscordHelper.stringFromStatus(
          t.status.code
        )}\n`;

        if (t.description) {
          toReturn += `*${t.description}*\n`;
        }

        if (t.dates.plannedDate) {
          const timestamp = Math.floor(t.dates.plannedDate.getTime() / 1000);
          toReturn += `You plan to do this task on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.deadline.date) {
          const timestamp = Math.floor(t.dates.deadline.date.getTime() / 1000);
          toReturn += `With deadline <t:${timestamp.toString()}:F>\n`;
        }

        if (t.trash.isIn && t.trash.deletionDate) {
          const timestamp = Math.floor(
            t.trash.deletionDate.date.getTime() / 1000
          );
          toReturn += `**Will be permanently removed <t:${timestamp.toString()}:R>**\n`;
        }

        toReturn += '**ID:** `';

        if (t.customId) {
          toReturn += `${t.customId}\``;
        } else {
          toReturn += `${t.id}\``;
        }

        if (parseInt(i) !== tasks.length - 1) {
          toReturn += taskSeparator;
        }
      }
      return toReturn;
    }

    return '';
  }

  private longFormatForCourse(tasks: Task[], taskSeparator: string): string {
    if (tasks.length) {
      let toReturn: string = '';
      for (const i in tasks) {
        const t = tasks[i];

        if (parseInt(i) === 0) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        }

        if (t.trash.isIn) {
          toReturn += '🗑 ';
        }

        if (t.priority === 1) {
          toReturn += '‼ ';
        } else if (t.priority === 2) {
          toReturn += '❗ ';
        }

        if (t.dates.deadline.reminder) {
          toReturn += '🔔 ';
        } else {
          toReturn += '🔕 ';
        }

        if (t.late) {
          toReturn += '🕓 ';
        }

        if (t.dormant) {
          toReturn += '💤 ';
        }

        toReturn += `**${t.title}** `;
        toReturn += `${this.taskDiscordHelper.stringFromStatus(
          t.status.code
        )}\n`;

        if (t.description) {
          toReturn += `*${t.description}*\n`;
        }

        if (t.dates.plannedDate) {
          const timestamp = Math.floor(t.dates.plannedDate.getTime() / 1000);
          toReturn += `You plan to do this task on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.wake.date && t.dormant) {
          const timestamp = Math.floor(t.dates.wake.date.getTime() / 1000);
          toReturn += `This task will wake up on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.deadline.date) {
          const timestamp = Math.floor(t.dates.deadline.date.getTime() / 1000);
          toReturn += `With deadline <t:${timestamp.toString()}:F>\n`;
          toReturn += `**Remind days before:** ${t.dates.deadline.daysBefore}\n`;
          toReturn += `**Interval:** ${t.dates.deadline.interval} horas\n`;
          toReturn += `**Offset:** ${t.dates.deadline.offset} horas\n`;
          toReturn += `**Remind days later:** ${t.dates.deadline.daysRemindAfter}\n`;
        }

        if (t.trash.isIn && t.trash.dateAdded) {
          const timestamp = Math.floor(t.trash.dateAdded.date.getTime() / 1000);
          toReturn += `**Trashed on:** <t:${timestamp.toString()}:F>\n`;
        }

        if (t.trash.isIn && t.trash.deletionDate) {
          const timestamp = Math.floor(
            t.trash.deletionDate.date.getTime() / 1000
          );
          toReturn += `**Will be permanently removed <t:${timestamp.toString()}:R>**\n`;
        }

        toReturn += '**ID:** `';

        if (t.customId) {
          toReturn += `${t.customId}\``;
        } else {
          toReturn += `${t.id}\``;
        }

        if (parseInt(i) !== tasks.length - 1) {
          toReturn += taskSeparator;
        }
      }
      return toReturn;
    }

    return '';
  }

  private shortFormatNoGrouping(tasks: Task[], taskSeparator: string): string {
    if (tasks.length) {
      let toReturn: string = '';
      for (const i in tasks) {
        const t = tasks[i];

        if (parseInt(i) === 0) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        } else if (
          parseInt(i) !== 0 &&
          tasks[(parseInt(i) - 1).toString()].context.code !== t.context.code
        ) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        }

        if (t.trash.isIn) {
          toReturn += '🗑 ';
        }

        if (t.priority === 1) {
          toReturn += '‼ ';
        } else if (t.priority === 2) {
          toReturn += '❗ ';
        }

        if (t.dates.deadline.reminder) {
          toReturn += '🔔 ';
        } else {
          toReturn += '🔕 ';
        }

        if (t.late) {
          toReturn += '🕓 ';
        }

        if (t.dormant) {
          toReturn += '💤 ';
        }

        toReturn += `**${t.title}** `;
        toReturn += `${this.taskDiscordHelper.stringFromStatus(
          t.status.code
        )}\n`;

        if (t.description) {
          toReturn += `*${t.description}*\n`;
        }

        if (t.dates.plannedDate) {
          const timestamp = Math.floor(t.dates.plannedDate.getTime() / 1000);
          toReturn += `You plan to do this task on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.deadline.date) {
          const timestamp = Math.floor(t.dates.deadline.date.getTime() / 1000);
          toReturn += `With deadline <t:${timestamp.toString()}:F>\n`;
        }

        if (t.trash.isIn && t.trash.deletionDate) {
          const timestamp = Math.floor(
            t.trash.deletionDate.date.getTime() / 1000
          );
          toReturn += `**Will be permanently removed <t:${timestamp.toString()}:R>**\n`;
        }

        toReturn += '**ID:** `';

        if (t.customId) {
          toReturn += `${t.customId}\``;
        } else {
          toReturn += `${t.id}\``;
        }

        if (parseInt(i) !== tasks.length - 1) {
          toReturn += taskSeparator;
        }
      }
      return toReturn;
    }

    return '';
  }

  private longFormatNoGrouping(tasks: Task[], taskSeparator: string): string {
    if (tasks.length) {
      let toReturn: string = '';
      for (const i in tasks) {
        const t = tasks[i];

        if (parseInt(i) === 0) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        } else if (
          parseInt(i) !== 0 &&
          tasks[(parseInt(i) - 1).toString()].context.code !== t.context.code
        ) {
          toReturn += `**——— __${t.context.string.toUpperCase()}__**\n`;
        }

        if (t.trash.isIn) {
          toReturn += '🗑 ';
        }

        if (t.priority === 1) {
          toReturn += '‼ ';
        } else if (t.priority === 2) {
          toReturn += '❗ ';
        }

        if (t.dates.deadline.reminder) {
          toReturn += '🔔 ';
        } else {
          toReturn += '🔕 ';
        }

        if (t.late) {
          toReturn += '🕓 ';
        }

        if (t.dormant) {
          toReturn += '💤 ';
        }

        toReturn += `**${t.title}** `;
        toReturn += `${this.taskDiscordHelper.stringFromStatus(
          t.status.code
        )}\n`;

        if (t.description) {
          toReturn += `*${t.description}*\n`;
        }

        if (t.dates.plannedDate) {
          const timestamp = Math.floor(t.dates.plannedDate.getTime() / 1000);
          toReturn += `You plan to do this task on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.wake.date && t.dormant) {
          const timestamp = Math.floor(t.dates.wake.date.getTime() / 1000);
          toReturn += `This task will wake up on <t:${timestamp.toString()}:F>\n`;
        }

        if (t.dates.deadline.date) {
          const timestamp = Math.floor(t.dates.deadline.date.getTime() / 1000);
          toReturn += `With deadline <t:${timestamp.toString()}:F>\n`;
          toReturn += `**Remind days before:** ${t.dates.deadline.daysBefore}\n`;
          toReturn += `**Interval:** ${t.dates.deadline.interval} horas\n`;
          toReturn += `**Offset:** ${t.dates.deadline.offset} horas\n`;
          toReturn += `**Remind days later:** ${t.dates.deadline.daysRemindAfter}\n`;
        }

        if (t.trash.isIn && t.trash.dateAdded) {
          const timestamp = Math.floor(t.trash.dateAdded.date.getTime() / 1000);
          toReturn += `**Trashed on:** <t:${timestamp.toString()}:F>\n`;
        }

        if (t.trash.isIn && t.trash.deletionDate) {
          const timestamp = Math.floor(
            t.trash.deletionDate.date.getTime() / 1000
          );
          toReturn += `**Will be permanently removed <t:${timestamp.toString()}:R>**\n`;
        }

        toReturn += '**ID:** `';

        if (t.customId) {
          toReturn += `${t.customId}\``;
        } else {
          toReturn += `${t.id}\``;
        }

        if (parseInt(i) !== tasks.length - 1) {
          toReturn += taskSeparator;
        }
      }
      return toReturn;
    }

    return '';
  }

  public format(
    tasks: Task[],
    shortFormat?: boolean,
    groupBy?: string,
    courseSeparator?: string,
    taskSeparator?: string
  ): string {
    if (!groupBy) {
      groupBy = this.taskDiscordHelper.config.group_by;
    }
    if (!courseSeparator) {
      courseSeparator = '\n\n';
    }
    if (!taskSeparator) {
      taskSeparator = '\n\n';
    }

    let toReturn: string = '';
    switch (groupBy) {
      case 'course':
        for (const i in contexts) {
          const courseTasks = tasks.filter(
            (task) => task.context.code === contexts[i]
          );
          if (courseTasks.length) {
            const sorter: TaskQuickSort = new TaskQuickSort();
            sorter.sort(courseTasks);

            let formattedCourse: string = '';
            if (shortFormat) {
              formattedCourse = this.shortFormatForCourse(
                courseTasks,
                taskSeparator
              );
            } else {
              formattedCourse = this.longFormatForCourse(
                courseTasks,
                taskSeparator
              );
            }

            toReturn += formattedCourse;
            if (parseInt(i) !== contexts.length - 1 && formattedCourse !== '') {
              toReturn += courseSeparator;
            }
          }
        }
        break;
      case 'none':
        const sorter: TaskQuickSort = new TaskQuickSort();
        sorter.sort(tasks);

        let formattedMessage: string = '';
        if (shortFormat) {
          formattedMessage = this.shortFormatNoGrouping(tasks, taskSeparator);
        } else {
          formattedMessage = this.longFormatNoGrouping(tasks, taskSeparator);
        }

        toReturn += formattedMessage;
        break;
      default:
        throw new Error(
          'invalid groupBy parameter passed to task formatting func'
        );
    }

    return toReturn;
  }

  public async reply(
    title: string,
    body: string,
    ephemeral?: boolean
  ): Promise<void> {
    if (ephemeral !== undefined) {
      return await this.retorter.retort(title, body, ephemeral);
    }

    return await this.retorter.retort(title, body, true);
  }

  public async init(): Promise<TaskDiscordContext> {
    if (this.initialized) {
      throw new Error('Task Discord context has already been initialized');
    }
    if (!this.replier.interaction.deferred) {
      await this.replier.interaction.deferReply({
        ephemeral: this.depherEphemerally,
      });
    }

    try {
      const retorterInfo = await this.registrationPipeline();
      if (
        retorterInfo.message === 'WAS_REGISTERED' ||
        retorterInfo.message === 'REGISTERED'
      ) {
        this.taskDiscordHelper = new TaskDiscordHelper(
          this.initialInteraction.user.id
        );
      } else {
        throw new Error("user isn't registered. halt everything");
      }
      this.retorter = new Retorter(retorterInfo, '\n\n', 1250);
    } catch (e) {
      switch (e.message) {
        case 'user-provided timezone had no matches':
          return await this.replier.followUp(
            this.title.error,
            'No time zone matched your input.',
            true
          );
        case 'there was an error during user registration':
          return await this.replier.followUp(
            this.title.error,
            'An error ocurred during sign-up. This incident has been saved.',
            true
          );
        default:
          throw new Error(e);
      }
    }
    this.initialized = true;
    return this;
  }
}

export async function createTaskDiscordContext(
  replier: Replier,
  depherEphemerally?: boolean
): Promise<TaskDiscordContext> {
  const tsctx = new TaskDiscordContext(replier, depherEphemerally);
  return await tsctx.init();
}
