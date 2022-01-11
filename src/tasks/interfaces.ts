import { TaskContext } from './contexts';
import { TaskStatus } from './statuses';
import { TaskUser } from './task_user';

/**
 * Represents the state of a task that already exists in the file system.
 */
export interface TaskExistanceState {
  /**
   * The Task's canonical ID.
   */
  id: string,
  /**
   * The custom ID of the Task, if any.
   */
  customId: string,
  /**
   * The Task's date of addition to the trash bin.
   */
  dateTrashed: string,
  /**
   * Whether the Task is being instantiated with the intention of editing it.
   */
  editingIntention?: boolean,
}

/**
 * Parameters for creating an instance of Task.
 */
export interface TaskCreationParameters {
  /**
   * The Task's title. If it exceeds 65 characters, it will be rejected.
   */
  title: string,
  /** 
   * The Task's context code.
   */
  contextCode: TaskContext,
  /**
   * An instance of the TaskUser class to aid in creating the task.
   */
  user: TaskUser,
  /** 
   * An object denoting the task's state in the file system. Only to be passed if the task already exists.
   */
  existing?: TaskExistanceState,
  /**
   * The Task's description. If it exceeds 250 characters, it will be rejected.
   */
  description?: string,
  /**
   * The Task's priority.
   */
  priority?: number,
  /**
   * The Task's status code.
   */
  statusCode?: TaskStatus,
  /**
   * The Task's custom ID, if any.
   */
  customId?: string,
  /**
   * Whether the Task should be marked as trashed.
   */
  markAsTrashed?: boolean,
  /**
   * The planned date string, provided by the user, to be parsed into a Date object. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  date?: string,
  /**
   * The deadline string, provided by the user, to be parsed into a Date object. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  deadline?: string,
  /**
   * Whether the calling implementation should remind the user about the Task's deadline.
   */
  deadlineReminder?: boolean,
  /**
   * How many days before the deadline should the calling implementation start reminding the user about the deadline.
   */
  deadlineReminderDaysBefore?: number,
  /**
   * The interval for deadline reminders, in hours.
   */
  deadlineReminderInterval?: number,
  /**
   * The offset for the deadline reminder, in hours. It is substracted from the deadline.
   */
  deadlineReminderOffset?: number,
  /**
   * For how long should the calling implementation keep reminding the user of the Task's deadline after it has passed.
   */
  deadlineKeepRemindingFor?: number,
  /**
   * Whether the Task is asleep.
   */
  asleep?: boolean,
  /**
   * The wake-up string, provided by the user. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  wakeIn?: string,
}

export interface TaskSearchOptions {
  id?: string,
  title?: string,
  description?: string,
  statusCode?: TaskStatus,
  contextCode?: TaskContext,
  date?: string,
  deadline?: string,
  asleep?: boolean,
  wakeIn?: string,
  late?: boolean,
  trash?: boolean,
}

/**
 * Parameters for the task editing process.
 */
 export interface TaskEditParameters {
  id: string,
  /**
   * The Task's title. If it exceeds 50 characters, it will be truncated.
   */
  title?: string,
  /** 
   * The Task's context code.
   */
  contextCode?: TaskContext,
  /**
   * An instance of the TaskUser class to aid in creating the task.
   */
  user?: TaskUser,
  /** 
   * An object denoting the task's state in the file system. Only to be passed if the task already exists.
   */
  existing?: TaskExistanceState,
  /**
   * The Task's description. If it exceeds 250 characters, it will be truncated.
   */
  description?: string,
  /**
   * The Task's priority.
   */
  priority?: number,
  /**
   * The Task's status code.
   */
  statusCode?: TaskStatus,
  /**
   * The Task's custom ID, if any.
   */
  customId?: string,
  /**
   * Whether the Task should be marked as trashed.
   */
  markAsTrashed?: boolean,
  /**
   * The planned date string, provided by the user, to be parsed into a Date object. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  date?: string,
  /**
   * The deadline string, provided by the user, to be parsed into a Date object. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  deadline?: string,
  /**
   * Whether the calling implementation should remind the user about the Task's deadline.
   */
  deadlineReminder?: boolean,
  /**
   * How many days before the deadline should the calling implementation start reminding the user about the deadline.
   */
  deadlineReminderDaysBefore?: number,
  /**
   * The interval for deadline reminders, in hours.
   */
  deadlineReminderInterval?: number,
  /**
   * The offset for the deadline reminder, in hours. It is substracted from the deadline.
   */
  deadlineReminderOffset?: number,
  /**
   * For how long should the calling implementation keep reminding the user of the Task's deadline after it has passed.
   */
  deadlineKeepRemindingFor?: number,
  /**
   * Whether the Task is asleep.
   */
  asleep?: boolean,
  /**
   * The wake-up string, provided by the user. It should conform to the following regex: `^202[1-2](-|\/)[0-1]\d(-|\/)[0-3]\d((\ |t|h)[0-2]?[0-9])?$`
   */
  wakeIn?: string,
}
