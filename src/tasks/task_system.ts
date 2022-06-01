import * as fs from 'fs';
import { ensureDirectory } from '../util/directory';
import { resolvePathFromSource } from '../util/resolve_path';
import { Task } from './task';
import { TaskDiscordHelper } from './task_discord_helper';
import { TaskUser } from './task_user';

/**
 * The TaskSystem class represents all relevant state of
 * the Emperor Tasks system at a given moment.
 *
 * @class TaskSystem
 * @constructor
 */
class TaskSystem {
  private initialized: boolean;
  private users: TaskUser[];
  private tasks: Task[];

  constructor() {}

  /**
   * Updates the Task System's cache of all users.
   */
  private async updateUsers(): Promise<void> {
    this.users = [];
    const userIds = fs.readdirSync(resolvePathFromSource('../data/tasks'));
    for (const i in userIds) {
      this.users.push(new TaskUser(userIds[i]));
    }
  }

  /**
   * Updates the Task System's cache of all tasks.
   */
  private async updateTasks(): Promise<void> {
    this.tasks = [];
    for (const i in this.users) {
      this.tasks = this.tasks.concat(await this.users[i].allTasks());
    }
  }

  /**
   * Updates the Task System's cache of both users and tasks.
   */
  public async updateState(): Promise<void> {
    await this.updateUsers();
    await this.updateTasks();
  }

  /**
   * Loads all dates in the file system into memory.
   *
   * @method loadDates
   * @param {any} client The Discord.js client.
   */
  public async loadDates(client: any): Promise<void> {
    for (const i in this.tasks) {
      const taskHelper = new TaskDiscordHelper(this.tasks[i].user.id);
      taskHelper.updateTaskDeadline(this.tasks[i], client);
      taskHelper.updateTaskRemovalDate(this.tasks[i]);
      taskHelper.updateTaskWakeDate(this.tasks[i]);
    }
  }

  /**
   * Initializes the class.
   *
   * @method init
   */
  public async init(): Promise<TaskSystem> {
    if (this.initialized) {
      throw new Error('Task System has already been initialized');
    }

    await this.updateState();

    this.initialized = true;
    return this;
  }
}

/**
 * Returns a promise that will resolve to an initialized Task System.
 */
export async function getTaskSystem(): Promise<TaskSystem> {
  ensureDirectory(resolvePathFromSource('../data/tasks'));
  const taskSystem = new TaskSystem();
  return await taskSystem.init();
}
