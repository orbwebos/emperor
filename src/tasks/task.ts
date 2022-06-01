import { randomBytes } from 'crypto';
import { isNullOrUndefined } from 'util';
import { addDays } from 'date-fns';
import { expandStatusCode, TaskStatus } from './statuses';
import { expandContextCode, TaskContext } from './contexts';
import { TaskUser } from './task_user';
import * as taskHelp from './helpers';
import { TaskCreationParameters } from './interfaces';
import { TaskPriority } from './misc';

export type JsonTask = {
  id: string;
  custom_id: string;
  leader_id: string;
  title: string;
  description: string;
  priority: number;
  is_late: boolean;
  trash: {
    is_in: boolean;
    date_added: string;
    deletion_date: string;
  };
  dormant: boolean;
  status: {
    code: string;
    string: string;
  };
  context: {
    code: string;
    string: string;
  };
  dates: {
    string: string;
    deadline: {
      string: string;
      reminder: boolean;
      days_before: number;
      interval: number;
      offset: number;
      days_remind_after: number;
    };
    wake: string;
  };
};

/**
 * This class represents all knowable information about an Emperor task.
 *
 * @class Task
 */
export class Task {
  id: string;
  customId: string;
  user: TaskUser;
  title: string;
  description: string;
  priority: TaskPriority;
  late: boolean;
  importance: number;
  trash: {
    isIn: boolean;
    dateAdded: {
      date: Date;
      string: string;
    };
    deletionDate: {
      date: Date;
      string: string;
    };
  };

  dormant: boolean;
  status: {
    code: TaskStatus;
    string: string;
  };

  context: {
    code: TaskContext;
    string: string;
  };

  dates: {
    plannedDate: Date;
    string: string;
    deadline: {
      date: Date;
      string: string;
      reminder: boolean;
      daysBefore: number;
      interval: number;
      offset: number;
      daysRemindAfter: number;
    };
    wake: {
      date: Date;
      string: string;
    };
  };

  /**
   * Constructor for the Task class.
   *
   * @param {TaskCreationParameters} params The options interface for instantiating a Task.
   */
  constructor(params: TaskCreationParameters) {
    const id = params.existing
      ? params.existing.id
      : randomBytes(3).toString('hex');

    this.user = params.user;

    if (isNullOrUndefined(params.priority)) {
      params.priority = TaskPriority.Normal;
    }
    if (isNullOrUndefined(params.deadlineReminder)) {
      params.deadlineReminder = this.user.config.tasks_remind_by_default;
    }
    if (
      isNullOrUndefined(params.deadlineReminderDaysBefore) ||
      params.deadlineReminderDaysBefore < 0
    ) {
      params.deadlineReminderDaysBefore = 1;
    }
    if (
      isNullOrUndefined(params.deadlineReminderInterval) ||
      params.deadlineReminderInterval < 1
    ) {
      params.deadlineReminderInterval = 15;
    }
    if (
      isNullOrUndefined(params.deadlineReminderOffset) ||
      params.deadlineReminderOffset < 0
    ) {
      params.deadlineReminderOffset = 3;
    }
    if (
      isNullOrUndefined(params.deadlineKeepRemindingFor) ||
      params.deadlineKeepRemindingFor < 0
    ) {
      params.deadlineKeepRemindingFor = 3;
    }
    if (isNullOrUndefined(params.statusCode)) {
      params.statusCode = TaskStatus.TODO;
    }
    if (isNullOrUndefined(params.markAsTrashed)) {
      params.markAsTrashed = false;
    }
    if (
      !params.existing &&
      !isNullOrUndefined(params.wakeIn) &&
      isNullOrUndefined(params.asleep)
    ) {
      params.asleep = true;
    } else if (!params.existing && isNullOrUndefined(params.asleep)) {
      params.asleep = false;
    }

    if (params.title.length > 65) {
      throw new Error("title can't exceed 65 characters");
    }
    if (
      !isNullOrUndefined(params.description) &&
      params.description.length > 250
    ) {
      throw new Error("description can't exceed 250 characters");
    }

    if (
      !isNullOrUndefined(params.customId) &&
      (isNullOrUndefined(params.existing) ||
        (params.existing.editingIntention &&
          params.existing.customId !== params.customId))
    ) {
      let idMatchResponse: string = '';
      try {
        idMatchResponse = this.user.walkTreeUntilParamMatch(
          taskHelp.taskInPathMatchesAnyId,
          params.customId
        );
      } catch (e) {
        throw new Error(`Error in checking for custom ID availability: ${e}`);
      }

      if (idMatchResponse !== '') {
        throw new Error('That ID is unavailable');
      }
    }

    let oDate: { date: Date; dateString: string } = {
      date: null,
      dateString: null,
    };
    let oDeadline: { date: Date; dateString: string } = {
      date: null,
      dateString: null,
    };
    let oWakeIn: { date: Date; dateString: string } = {
      date: null,
      dateString: null,
    };
    try {
      if (params.date) {
        oDate = taskHelp.validateAndGetTaskDate(
          params.date,
          this.user.config.time_zone
        );
      }
      if (params.deadline) {
        oDeadline = taskHelp.validateAndGetTaskDate(
          params.deadline,
          this.user.config.time_zone
        );
      }
      if (params.wakeIn) {
        oWakeIn = taskHelp.validateAndGetTaskDate(
          params.wakeIn,
          this.user.config.time_zone
        );
      }
    } catch (e) {
      throw new Error(e);
    }

    const plannedDateString = oDate.dateString;
    const deadlineString = oDeadline.dateString;

    const now = new Date();
    const trashAddedDate = params.existing
      ? new Date(params.existing.dateTrashed)
      : now;
    const trashDeletionDate = addDays(trashAddedDate, 30);

    this.id = id;
    this.customId = params.customId;
    this.title = params.title;
    this.description = params.description;
    this.priority = params.priority;
    this.late = oDeadline.date === null ? false : oDeadline.date < new Date();
    this.trash = {
      isIn: params.markAsTrashed,
      dateAdded: {
        date: params.markAsTrashed ? trashAddedDate : now,
        string: params.markAsTrashed
          ? trashAddedDate.toISOString()
          : now.toISOString(),
      },
      deletionDate: {
        date: params.markAsTrashed ? trashDeletionDate : now,
        string: params.markAsTrashed
          ? trashDeletionDate.toISOString()
          : now.toISOString(),
      },
    };
    this.dormant = params.asleep;
    this.status = {
      code: params.statusCode,
      string: expandStatusCode(params.statusCode),
    };
    this.context = {
      code: params.contextCode,
      string: expandContextCode(params.contextCode),
    };
    this.dates = {
      plannedDate: oDate.date,
      string: plannedDateString,
      deadline: {
        date: oDeadline.date,
        string: deadlineString,
        reminder: params.deadlineReminder,
        daysBefore: params.deadlineReminderDaysBefore,
        interval: params.deadlineReminderInterval,
        offset: params.deadlineReminderOffset,
        daysRemindAfter: params.deadlineKeepRemindingFor,
      },
      wake: {
        date: oWakeIn.date,
        string: oWakeIn.dateString,
      },
    };

    this.updateImportance();
  }

  /**
   * Returns an object that maps uniformly to the JSON representation of Emperor tasks.
   *
   * @method getObject
   */
  getObject(): JsonTask {
    return {
      id: this.id,
      custom_id: this.customId,
      leader_id: this.user.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      is_late: this.late,
      trash: {
        is_in: this.trash.isIn,
        date_added: this.trash.dateAdded.string,
        deletion_date: this.trash.deletionDate.string,
      },
      dormant: this.dormant,
      status: {
        code: this.status.code,
        string: this.status.string,
      },
      context: {
        code: this.context.code,
        string: this.context.string,
      },
      dates: {
        string: this.dates.string,
        deadline: {
          string: this.dates.deadline.string,
          reminder: this.dates.deadline.reminder,
          days_before: this.dates.deadline.daysBefore,
          interval: this.dates.deadline.interval,
          offset: this.dates.deadline.offset,
          days_remind_after: this.dates.deadline.daysRemindAfter,
        },
        wake: this.dates.wake.string,
      },
    };
  }

  /**
   * Calculates and updates the Task's importance value.
   *
   * @method updateImportance
   */
  public updateImportance(): void {
    let importance: number = 0;

    if (this.dates.deadline.reminder) {
      importance += 250;
    }
    if (this.late) {
      importance += 400;
    }

    if (this.priority === 1) {
      importance += 1000;
    } else if (this.priority === 2) {
      importance += 500;
    }

    switch (this.context.code) {
      case TaskContext.Work:
        importance += 50;
        break;
      case TaskContext.Personal:
        importance += 40;
        break;
      case TaskContext.Social:
        importance += 30;
        break;
      case TaskContext.Hobbies:
        importance += 20;
        break;
      case TaskContext.Other:
        importance += 10;
        break;
      default:
        throw new Error(
          `state error: invalid context code: ${this.context.code}`
        );
    }

    if (this.status.code === 'FEEDBACK') {
      importance -= 800;
    }
    if (this.status.code === 'DELEGATED') {
      importance -= 4000;
    }
    if (this.status.code === 'DONE') {
      importance -= 5000;
    }
    if (this.dormant) {
      importance -= 7000;
    }
    if (this.trash.isIn) {
      importance -= 20000;
    }

    this.importance = importance;
  }

  /**
   * @returns {boolean} Whether the calling implementation should remind the user of the Task's deadline.
   */
  shouldRemind(): boolean {
    return (
      !this.trash.isIn &&
      this.dates.deadline.reminder &&
      this.status.code !== 'DONE'
    );
  }
}
