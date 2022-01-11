import * as fs from 'fs';
import rimraf from 'rimraf';
import { resolvePathFromSource } from '../util/resolve_path';
import { contexts, TaskContext } from './contexts';
import { StateManager } from '../util/state_manager';
import { BaseTaskUser } from './base_task_user';
import * as thelp from './helpers';
import { Task } from './task';
import _ from 'lodash';
import Fuse from 'fuse.js'
import { JsonTask } from './task';
import { isNullOrUndefined } from 'util';
import { TaskCreationParameters, TaskEditParameters, TaskSearchOptions } from './interfaces';
import { TaskStatus } from './statuses';

export class TaskUser extends BaseTaskUser {
  id: string;
  config: any;

  constructor(userId: string) {
    super(userId);
    const manager = new StateManager(`../data/tasks/${this.id}/userConfig.json`);
    const configObject = manager.readSync();
    this.config = configObject;
  }

  async changeSettings(configObject: any): Promise<void> {
    const manager = new StateManager(`../data/tasks/${this.id}/userConfig.json`);
    await manager.edit(configObject);
    this.config = configObject;
  }

  async remove(userId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.isRegistered) {
        rimraf(resolvePathFromSource(`../data/tasks/${userId}`), (err) => {
          if (err) {
            reject(err);
          }
        });
      }
      else {
        resolve('USER_DIDNT_EXIST');
      }
      resolve('USER_REMOVED');
    });
  }

  walkTreeUntilParamMatch(func: any, param: any): string {
    for (const i in contexts) {
      const files = fs.readdirSync(resolvePathFromSource(`../data/tasks/${this.id}/${contexts[i]}`));
      for (const ix in files) {
        const path = `../data/tasks/${this.id}/${contexts[i]}/${files[ix]}`;
        const returnedValue = func(path, param)
        if (returnedValue === true) {
          return path;
        }
      }
    }
    return '';
  }

  walkTreeFindAllMatches(func: any): string[] {
    let matches: string[] = [];
    for (const i in contexts) {
      const files = fs.readdirSync(resolvePathFromSource(`../data/tasks/${this.id}/${contexts[i]}`));
      for (const ix in files) {
        const path = `../data/tasks/${this.id}/${contexts[i]}/${files[ix]}`;
        if (func(path) === true) {
          matches.push(path);
        }
      }
    }
    return matches;
  }

  async taskObjectById(id: string): Promise<JsonTask> {
    const idMatchPath = this.walkTreeUntilParamMatch(thelp.taskInPathMatchesAnyId, id);
    if (idMatchPath !== '') {
      const manager = new StateManager(idMatchPath);
      try {
        const taskData = manager.readSync();
        return taskData;
      }
      catch(e) {
        throw new Error(e);
      }
    }
    else {
      throw new Error('No match for that ID');
    }
  }

  async taskById(id: string): Promise<Task> {
    const jsonTask = await this.taskObjectById(id);
    return this.taskFromObject(jsonTask);
  }

  async removeById(id: string): Promise<void> {
    const idMatchPath = this.walkTreeUntilParamMatch(thelp.taskInPathMatchesAnyId, id);
    if (idMatchPath !== '') {
      try {
        thelp.unloadJobsStartingWith(id);
        return fs.unlinkSync(resolvePathFromSource(idMatchPath));
      }
      catch(e) {
        throw new Error(e);
      }
    }
    else {
      throw new Error('No match for that ID');
    }
  }

  async allTaskPaths(): Promise<string[]> {
    const matches = this.walkTreeFindAllMatches(thelp.pathEndsOnJson);
    if (matches.length > 0) {
      return matches;
    }
    else {
      throw new Error('No tasks found');
    }
  }

  taskFromObject(jsonTask: JsonTask): Task {
    const task = new Task({
      existing: { id: jsonTask.id, customId: jsonTask.custom_id, dateTrashed: jsonTask.trash.date_added },
      title: jsonTask.title,
      contextCode: (jsonTask.context.code as TaskContext),
      user: this,
      description: jsonTask.description,
      priority: jsonTask.priority,
      statusCode: (jsonTask.status.code as TaskStatus),
      customId: jsonTask.custom_id,
      markAsTrashed: jsonTask.trash.is_in,
      date: jsonTask.dates.string,
      deadline: jsonTask.dates.deadline.string,
      deadlineReminder: jsonTask.dates.deadline.reminder,
      deadlineReminderDaysBefore: jsonTask.dates.deadline.days_before,
      deadlineReminderInterval: jsonTask.dates.deadline.interval,
      deadlineReminderOffset: jsonTask.dates.deadline.offset,
      deadlineKeepRemindingFor: jsonTask.dates.deadline.days_remind_after,
      asleep: jsonTask.dormant,
      wakeIn: jsonTask.dates.wake
    });

    return task;
  }

  async allTaskObjects(): Promise<JsonTask[]> {
    let tasks: JsonTask[] = []
    try {
      const paths = await this.allTaskPaths();
      for (const i in paths) {
        const manager = new StateManager(paths[i]);
        tasks.push(manager.readSync());
      }
    }
    catch(e) {
      throw new Error(e);
    }

    return tasks
  }

  async allTasks(): Promise<Task[]> {
    const tasks: Task[] = [];
    const taskObjects = await this.allTaskObjects();
    for (const i in taskObjects) {
      const task = this.taskFromObject(taskObjects[i]);
      tasks.push(task)
    }

    return tasks;
  }

  async write(cTask: Task): Promise<any> {
    const task = await cTask.getObject();
    return new Promise<any>((resolve, reject) => {
      const manager = new StateManager(`../data/tasks/${this.id}/${task.context.code}/${task.id}.json`);
      manager.edit(task)
      .then(response => {
        if (response.includes('Wrote to')) {
          resolve(task);
        }
      })
      .catch(e => reject(`Couldn't register task: ${e}`));
    });
  }

  async addTask(options: TaskCreationParameters): Promise<Task> {
    try {
      const task = new Task(options);

      await this.write(task);
      return task;
    }
    catch(e) {
      throw new Error(`Error in adding task: ${e}`);
    }
  }

  async search(filters: TaskSearchOptions): Promise<Task[]> {
    const allTasks = await this.allTasks();

    const titleSearch = {
      threshold: 0.4,
      keys: [
        'title'
      ]
    };

    const descriptionSearch = {
      keys: [
        'description'
      ]
    };

    const fuseTitle = new Fuse(allTasks, titleSearch);
    const fuseDescription = new Fuse(allTasks, descriptionSearch);

    const titleResults: Fuse.FuseResult<Task>[] | Task[] = filters.title ? fuseTitle.search(filters.title) : allTasks;
    const descriptionResults: Fuse.FuseResult<Task>[] | Task[] = filters.description ? fuseDescription.search(filters.description) : allTasks;

    let resultsJunction = _.intersection(thelp.ensureIsTaskArray(titleResults), thelp.ensureIsTaskArray(descriptionResults));

    if (!isNullOrUndefined(filters.id)) {
      resultsJunction = resultsJunction.filter(task => task.id === filters.id || task.customId === filters.id);
    }
    if (!isNullOrUndefined(filters.statusCode)) {
      resultsJunction = resultsJunction.filter(task => task.status.code === filters.statusCode);
    }
    if (!isNullOrUndefined(filters.contextCode)) {
      resultsJunction = resultsJunction.filter(task => task.context.code === filters.contextCode);
    }
    if (!isNullOrUndefined(filters.date)) {
      resultsJunction = resultsJunction.filter(task => !isNullOrUndefined(task.dates.string) && task.dates.string.includes(filters.date))
    }
    if (!isNullOrUndefined(filters.deadline)) {
      resultsJunction = resultsJunction.filter(task => !isNullOrUndefined(task.dates.deadline.string) && task.dates.deadline.string.includes(filters.deadline))
    }
    if (!isNullOrUndefined(filters.asleep)) {
      resultsJunction = resultsJunction.filter(task => task.dormant === filters.asleep);
    }
    if (!isNullOrUndefined(filters.wakeIn)) {
      resultsJunction = resultsJunction.filter(task => !isNullOrUndefined(task.dates.wake.string) && task.dates.wake.string.includes(filters.wakeIn))
    }
    if (!isNullOrUndefined(filters.late)) {
      resultsJunction = resultsJunction.filter(task => task.late === filters.late);
    }
    if (!isNullOrUndefined(filters.trash)) {
      resultsJunction = resultsJunction.filter(task => task.trash.isIn === filters.trash);
    }

    return resultsJunction;
  }

  async edit(o: TaskEditParameters): Promise<{ original: Task, modified: Task }> {
    const t = await this.taskById(o.id)
    const original = t;

    const task = new Task({
      existing: { id: t.id, customId: t.customId, dateTrashed: t.trash.dateAdded.string, editingIntention: true },
      title: o.title ? o.title : t.title,
      contextCode: o.contextCode ? (o.contextCode as TaskContext) : t.context.code,
      user: this,
      description: o.description ? o.description : t.description,
      priority: o.priority ? o.priority : t.priority,
      statusCode: o.statusCode ? o.statusCode : t.status.code,
      customId: o.customId ? o.customId : t.customId,
      markAsTrashed: !isNullOrUndefined(o.markAsTrashed) ? o.markAsTrashed : t.trash.isIn,
      date: o.date ? o.date : t.dates.string,
      deadline: o.deadline ? o.deadline : t.dates.deadline.string,
      deadlineReminder: !isNullOrUndefined(o.deadlineReminder) ? o.deadlineReminder : t.dates.deadline.reminder,
      deadlineReminderDaysBefore: o.deadlineReminderDaysBefore ? o.deadlineReminderDaysBefore : t.dates.deadline.daysBefore,
      deadlineReminderInterval: o.deadlineReminderInterval ? o.deadlineReminderInterval : t.dates.deadline.interval,
      deadlineReminderOffset: o.deadlineReminderOffset ? o.deadlineReminderOffset : t.dates.deadline.offset,
      deadlineKeepRemindingFor: o.deadlineKeepRemindingFor ? o.deadlineKeepRemindingFor : t.dates.deadline.daysRemindAfter,
      asleep: !isNullOrUndefined(o.asleep) ? o.asleep : t.dormant,
      wakeIn: o.wakeIn ? o.wakeIn : t.dates.wake.string,
    });

    await this.write(task);
    return { original: original, modified: task };
  }
}
