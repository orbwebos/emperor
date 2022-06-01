import { addDays, subHours } from 'date-fns';
import subDays from 'date-fns/subDays';
import * as schedule from 'node-schedule';
import addMinutes from 'date-fns/addMinutes';
import { CommandInteraction } from 'discord.js';
import { isNullOrUndefined } from 'util';
import { Task } from './task';
import { TaskStatus } from './statuses';
import { TaskContext } from './contexts';
import { TaskUser } from './task_user';
import { resolveTimeZone } from './helpers';
import { EmperorEmbedder } from '../emperor/embedder';
import * as log from '../util/logging';
import { ConfigManager } from '../util/config_manager';

export class TaskDiscordHelper extends TaskUser {
  private formatForDm(tasks: Task[], taskSeparator: string): string {
    if (tasks.length) {
      let toReturn = '';
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
        toReturn += `${this.stringFromStatus(t.status.code)}\n`;

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

  public dm(client: any, task: Task, stage: number): void {
    const timestamp = `<t:${Math.floor(
      task.dates.deadline.date.getTime() / 1000
    ).toString()}:R>`;

    let title = '';
    let toSend = '';
    if (stage === 1) {
      title = 'Deadline reminder';
      toSend = `The deadline for the following task is ${timestamp}:\n\n${this.formatForDm(
        [task],
        'none'
      )}`;
    } else if (stage === 2) {
      title = 'Your task is late';
      toSend = `The deadline for the following task passed ${timestamp}:\n\n${this.formatForDm(
        [task],
        'none'
      )}`;
    } else if (stage === 3) {
      title = 'Reminder of late task';
      toSend = `Your task, **${
        task.title
      }**, is still late. Its deadline passed ${timestamp}:\n\n${this.formatForDm(
        [task],
        'none'
      )}`;
    } else {
      log.error(client, 'Invalid stage for DMing user in Tasks module.');
    }

    const embedder = new EmperorEmbedder(
      'Tasks module',
      new ConfigManager().general.tasks_module_picture
    );
    const embed = embedder.emperorEmbed(title, toSend, '#ffa500');
    client.users
      .fetch(task.user.id)
      .then((owner) => owner.send({ embeds: [embed] }))
      .catch((e) => console.error(e));
  }

  public updateTaskDeadline(task: Task, client: any): void {
    if (task.dates.deadline.date === null || task.trash.isIn) {
      return;
    }

    const { scheduledJobs } = schedule;
    for (const i in scheduledJobs) {
      if (
        scheduledJobs[i].name.startsWith(`${task.id}-normal`) ||
        scheduledJobs[i].name.startsWith(`${task.id}-alert`) ||
        scheduledJobs[i].name.startsWith(`${task.id}-overdue`)
      ) {
        scheduledJobs[i].cancel();
      }
    }

    const startRemindingDate = subDays(
      task.dates.deadline.date,
      task.dates.deadline.daysBefore
    );
    let workingDate = subHours(
      task.dates.deadline.date,
      task.dates.deadline.offset
    );

    // These are the standard task reminders that fire in the days leading up to the deadline.
    for (
      let i = 1;
      startRemindingDate < workingDate && new Date() < workingDate;
      i++
    ) {
      schedule.scheduleJob(
        `${task.id}-normal-${i.toString()}`,
        workingDate,
        () => {
          if (task.shouldRemind()) {
            this.dm(client, task, 1);
          }
        }
      );
      workingDate = subHours(workingDate, task.dates.deadline.interval);
    }

    // This is the "task is now overdue" alert set to fire 15 minutes after the task goes overdue.
    const nowOverdue = addMinutes(task.dates.deadline.date, 15);
    schedule.scheduleJob(`${task.id}-alert`, nowOverdue, () => {
      if (task.shouldRemind()) {
        this.dm(client, task, 2);
      }
    });

    // This is the "your overdue task is still in need of doing" reminders that fire
    // in the days after the deadline is met but the task isn't marked as DONE.
    for (let i = 0; i < task.dates.deadline.daysRemindAfter; i++) {
      const dateOverdue = addDays(task.dates.deadline.date, i + 1);
      if (new Date() < dateOverdue) {
        schedule.scheduleJob(
          `${task.id}-overdue-${(i + 1).toString()}`,
          dateOverdue,
          () => {
            if (task.shouldRemind()) {
              this.dm(client, task, 3);
            }
          }
        );
      }
    }
  }

  public updateTaskWakeDate(task: Task): void {
    if (task.dates.wake.date === null || task.trash.isIn) {
      return;
    }

    const { scheduledJobs } = schedule;
    for (const i in scheduledJobs) {
      if (scheduledJobs[i].name.startsWith(`${task.id}-wake`)) {
        scheduledJobs[i].cancel();
      }
    }

    schedule.scheduleJob(`${task.id}-wake`, task.dates.wake.date, async () => {
      await this.edit({ id: task.id, asleep: false });
    });
  }

  public updateTaskRemovalDate(task: Task): void {
    const { scheduledJobs } = schedule;
    for (const i in scheduledJobs) {
      if (scheduledJobs[i].name.startsWith(`${task.id}-trash`)) {
        scheduledJobs[i].cancel();
      }
    }

    if (!task.trash.isIn) {
      return;
    }

    for (const i in scheduledJobs) {
      if (scheduledJobs[i].name.startsWith(`${task.id}`)) {
        scheduledJobs[i].cancel();
      }
    }

    schedule.scheduleJob(
      `${task.id}-trash`,
      task.trash.deletionDate.date,
      async () => {
        if (task.trash.isIn) {
          await this.removeById(task.id);
        }
      }
    );
  }

  public stringFromStatus(statusCode: TaskStatus): string {
    const config = new ConfigManager().general;
    switch (statusCode) {
      case TaskStatus.TODO:
        return config.tasks_todo_string;
      case TaskStatus.DONE:
        return config.tasks_done_string;
      case TaskStatus.DELEGATED:
        return config.tasks_delegated_string;
      case TaskStatus.FEEDBACK:
        return config.tasks_feedback_string;
      default:
        throw new Error('invalid status code for string from status');
    }
  }

  public async addTaskFromInteraction(i: CommandInteraction): Promise<Task> {
    const contextCode: string = i.options.getString('context');
    const title: string = i.options.getString('title');
    const description: string = i.options.getString('description');
    const priority: number = i.options.getInteger('priority');
    const personalizedId: string = i.options.getString('custom-id');
    const dateStr: string = i.options.getString('date');
    const deadlineStr: string = i.options.getString('deadline');
    const deadlineReminder: boolean = i.options.getBoolean('deadline-reminder');
    const deadlineReminderDaysBefore: number = i.options.getInteger(
      'deadline-reminder-days-before'
    );
    const deadlineReminderInterval: number = i.options.getInteger(
      'deadline-reminder-interval'
    );
    const deadlineReminderOffset: number = i.options.getInteger(
      'deadline-reminder-offset'
    );
    const deadlineKeepRemindingFor: number =
      i.options.getInteger('keep-reminding-for');
    const wakeIn: string = i.options.getString('despertar-en');

    const task = await this.addTask({
      title,
      contextCode: contextCode as TaskContext,
      user: new TaskUser(this.id),
      description,
      priority,
      customId: personalizedId,
      date: dateStr,
      deadline: deadlineStr,
      deadlineReminder,
      deadlineReminderDaysBefore,
      deadlineReminderInterval,
      deadlineReminderOffset,
      deadlineKeepRemindingFor,
      wakeIn,
    });

    this.updateTaskDeadline(task, i.client);
    this.updateTaskWakeDate(task);
    this.updateTaskRemovalDate(task);

    return task;
  }

  public async searchFromInteraction(i: CommandInteraction): Promise<Task[]> {
    const idFilter: string = i.options.getString('filter-id');
    const titleFilter: string = i.options.getString('filter-titles');
    const descriptionFilter: string = i.options.getString(
      'filter-descriptions'
    );
    const statusFilter: string = i.options.getString('filter-state');
    const contextFilter: string = i.options.getString('filter-context');
    const dateFilter: string = i.options.getString('filter-date');
    const deadlineFilter: string = i.options.getString('filter-deadline');
    const asleepFilter: boolean = i.options.getBoolean('filter-asleep');
    const wakeDateFilter: string = i.options.getString('filter-wake-date');
    const lateFilter: boolean = i.options.getBoolean('filter-late');
    const trashFilter: boolean = i.options.getBoolean('filter-trashed');

    return this.search({
      id: idFilter,
      title: titleFilter,
      description: descriptionFilter,
      statusCode: statusFilter as TaskStatus,
      contextCode: contextFilter as TaskContext,
      date: dateFilter,
      deadline: deadlineFilter,
      asleep: asleepFilter,
      wakeIn: wakeDateFilter,
      late: lateFilter,
      trash: trashFilter,
    });
  }

  public async editFromInteraction(
    i: CommandInteraction
  ): Promise<{ original: Task; modified: Task }> {
    const id: string = i.options.getString('id');
    const title: string = i.options.getString('title');
    const description: string = i.options.getString('description');
    const status: string = i.options.getString('state');
    const contextCode: string = i.options.getString('context');
    const priority: number = i.options.getInteger('priority');
    const personalizedId: string = i.options.getString('custom-id');
    const dateStr: string = i.options.getString('date');
    const deadlineStr: string = i.options.getString('deadline');
    const deadlineReminder: boolean = i.options.getBoolean('deadline-reminder');
    const deadlineReminderDaysBefore: number = i.options.getInteger(
      'deadline-reminder-days-before'
    );
    const deadlineReminderInterval: number = i.options.getInteger(
      'deadline-reminder-interval'
    );
    const deadlineReminderOffset: number = i.options.getInteger(
      'deadline-reminder-offset'
    );
    const deadlineKeepRemindingFor: number =
      i.options.getInteger('keep-reminding-for');
    const asleep: boolean = i.options.getBoolean('asleep');
    const wakeIn: string = i.options.getString('wake-in');
    const markAsTrashed: boolean = i.options.getBoolean('trashed');

    const options: any[] = [
      contextCode,
      title,
      description,
      priority,
      personalizedId,
      dateStr,
      status,
      deadlineStr,
      deadlineReminder,
      deadlineReminderDaysBefore,
      deadlineReminderInterval,
      deadlineReminderOffset,
      deadlineKeepRemindingFor,
      asleep,
      wakeIn,
      markAsTrashed,
    ];

    let atLeastOneNonNull = false;
    for (const i in options) {
      if (!isNullOrUndefined(options[i])) {
        atLeastOneNonNull = true;
        break;
      }
    }
    if (!atLeastOneNonNull) {
      throw new Error('At least one parameter is needed for editing');
    }

    const resp = await this.edit({
      id,
      title,
      contextCode: contextCode as TaskContext,
      user: new TaskUser(this.id),
      description,
      statusCode: status as TaskStatus,
      priority,
      customId: personalizedId,
      date: dateStr,
      deadline: deadlineStr,
      deadlineReminder,
      deadlineReminderDaysBefore,
      deadlineReminderInterval,
      deadlineReminderOffset,
      deadlineKeepRemindingFor,
      asleep,
      wakeIn,
      markAsTrashed,
    });

    this.updateTaskDeadline(resp.modified, i.client);
    this.updateTaskWakeDate(resp.modified);
    this.updateTaskRemovalDate(resp.modified);

    return resp;
  }

  public async removeFromInteraction(
    i: CommandInteraction
  ): Promise<{ trashed: Task[]; removed: Task[] }> {
    const idFilter: string = i.options.getString('by-id');
    const titleFilter: string = i.options.getString('by-title');
    const descriptionFilter: string = i.options.getString('by-description');
    const statusFilter: string = i.options.getString('by-state');
    const contextFilter: string = i.options.getString('by-context');
    const dateFilter: string = i.options.getString('by-date');
    const deadlineFilter: string = i.options.getString('by-deadline');
    const asleepFilter: boolean = i.options.getBoolean('by-asleep');
    const wakeDateFilter: string = i.options.getString('by-wake-date');
    const lateFilter: boolean = i.options.getBoolean('late');
    const trashFilter: boolean = i.options.getBoolean('trashed');
    const force: boolean = i.options.getBoolean('force');

    const options = [
      idFilter,
      titleFilter,
      descriptionFilter,
      statusFilter,
      contextFilter,
      dateFilter,
      deadlineFilter,
      asleepFilter,
      wakeDateFilter,
      lateFilter,
      trashFilter,
    ];

    let atLeastOneNonNull = false;
    for (const i in options) {
      if (!isNullOrUndefined(options[i])) {
        atLeastOneNonNull = true;
        break;
      }
    }
    if (!atLeastOneNonNull && this.config.remove_requires_options) {
      throw new Error('REMOVE_REQUIRES_OPTIONS_AND_NONE_WAS_PASSED');
    }

    const tasks = await this.search({
      id: idFilter,
      title: titleFilter,
      description: descriptionFilter,
      statusCode: statusFilter as TaskStatus,
      contextCode: contextFilter as TaskContext,
      date: dateFilter,
      deadline: deadlineFilter,
      asleep: asleepFilter,
      wakeIn: wakeDateFilter,
      late: lateFilter,
      trash: trashFilter,
    });

    const trashed: Task[] = [];
    const removed: Task[] = [];

    for (const i in tasks) {
      if (tasks[i].trash.isIn || force) {
        removed.push(tasks[i]);
        await this.removeById(tasks[i].id);
      } else {
        trashed.push(tasks[i]);
        await this.edit({ id: tasks[i].id, markAsTrashed: true });
      }
    }

    return { trashed, removed };
  }

  public async changeStatusFromInteraction(
    i: CommandInteraction
  ): Promise<{ tasks: Task[]; status: TaskStatus }> {
    const status: string = i.options.getString('state');
    const idFilter: string = i.options.getString('filter-id');
    const titleFilter: string = i.options.getString('filter-titles');
    const descriptionFilter: string = i.options.getString(
      'filter-descriptions'
    );
    const statusFilter: string = i.options.getString('filter-state');
    const contextFilter: string = i.options.getString('filter-context');
    const dateFilter: string = i.options.getString('filter-date');
    const deadlineFilter: string = i.options.getString('filter-deadline');
    const asleepFilter: boolean = i.options.getBoolean('filter-asleep');
    const wakeDateFilter: string = i.options.getString('filter-wake-date');
    const lateFilter: boolean = i.options.getBoolean('filter-late');
    const trashFilter: boolean = i.options.getBoolean('filter-trashed');

    const found = await this.search({
      id: idFilter,
      title: titleFilter,
      description: descriptionFilter,
      statusCode: statusFilter as TaskStatus,
      contextCode: contextFilter as TaskContext,
      date: dateFilter,
      deadline: deadlineFilter,
      asleep: asleepFilter,
      wakeIn: wakeDateFilter,
      late: lateFilter,
      trash: trashFilter,
    });

    const tasks: Task[] = [];

    for (const i in found) {
      tasks.push(found[i]);
      await this.edit({ id: found[i].id, statusCode: status as TaskStatus });
    }

    return { tasks, status: status as TaskStatus };
  }

  public async editUserConfigFromInteraction(i: CommandInteraction): Promise<{
    map: Map<string, { original: string; modified: string }>;
    optionsPassed: boolean;
  }> {
    const timeZone: string = i.options.getString('time-zone');
    const reminderByDefault: boolean = i.options.getBoolean(
      'tasks-remind-by-default'
    );
    const groupBy: string = i.options.getString('group-tasks-by');
    const removeRequiresOptions: boolean = i.options.getBoolean(
      'removing-requires-options'
    );

    const options: any[] = [
      timeZone,
      reminderByDefault,
      groupBy,
      removeRequiresOptions,
    ];

    let atLeastOneNonNull = false;
    for (const i in options) {
      if (!isNullOrUndefined(options[i])) {
        atLeastOneNonNull = true;
        break;
      }
    }
    if (!atLeastOneNonNull) {
      return {
        map: new Map([
          [
            'Time zone',
            {
              original: this.config.time_zone,
              modified: this.config.time_zone,
            },
          ],
          [
            'Should tasks establish reminders by default',
            {
              original: this.config.tasks_remind_by_default,
              modified: this.config.tasks_remind_by_default,
            },
          ],
          [
            'Group tasks by',
            { original: this.config.group_by, modified: this.config.group_by },
          ],
          [
            'Removing requires options',
            {
              original: this.config.remove_requires_options,
              modified: this.config.remove_requires_options,
            },
          ],
        ]),
        optionsPassed: false,
      };
    }

    let tz = '';
    if (timeZone) {
      tz = resolveTimeZone(timeZone);
    }

    const previousCfg = this.config;

    await this.changeSettings({
      id: this.id,
      time_zone: timeZone ? tz : this.config.time_zone,
      tasks_remind_by_default: !isNullOrUndefined(reminderByDefault)
        ? reminderByDefault
        : this.config.tasks_remind_by_default,
      group_by: groupBy || this.config.group_by,
      remove_requires_options: !isNullOrUndefined(removeRequiresOptions)
        ? removeRequiresOptions
        : this.config.remove_requires_options,
    });

    const map = new Map();

    if (timeZone) {
      map.set('Time zone', {
        original: previousCfg.time_zone,
        modified: this.config.time_zone,
      });
    }
    if (!isNullOrUndefined(reminderByDefault)) {
      map.set('Should tasks establish reminders by default', {
        original: previousCfg.tasks_remind_by_default,
        modified: this.config.tasks_remind_by_default,
      });
    }
    if (groupBy) {
      map.set('Group tasks by', {
        original: previousCfg.group_by,
        modified: this.config.group_by,
      });
    }
    if (!isNullOrUndefined(removeRequiresOptions)) {
      map.set('Removing requires options', {
        original: previousCfg.remove_requires_options,
        modified: this.config.remove_requires_options,
      });
    }

    return { map, optionsPassed: true };
  }
}
