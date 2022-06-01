import * as fs from 'fs';
import Fuse from 'fuse.js';
import { listTimeZones } from 'timezone-support';
import { parseFromTimeZone } from 'date-fns-timezone';
import { resolvePathFromSource } from '../util/resolve_path';
import { StateManager } from '../util/state_manager';
import { Task } from './task';
import { ensureDirectory } from '../util/directory';

export function resolveTimeZone(inputTimeZone: string): string {
  const tz = listTimeZones();

  const fuse = new Fuse(tz);

  const results = fuse.search(inputTimeZone);
  if (results.length > 0) {
    return results[0].item;
  }

  throw new Error('No timezone matched the provided string');
}

export function getAllUsers(): string[] {
  ensureDirectory(resolvePathFromSource('../data/tasks'));
  return fs.readdirSync(resolvePathFromSource('../data/tasks'));
}

export function taskInPathMatchesId(taskPath: string, id: string): boolean {
  try {
    const manager = new StateManager(taskPath);
    const taskData = manager.readSync();
    return taskData.id === id;
  } catch (e) {
    throw new Error(e);
  }
}

export function taskInPathMatchesCustomId(
  taskPath: string,
  customId: string
): boolean {
  try {
    const manager = new StateManager(taskPath);
    const taskData = manager.readSync();
    return taskData.custom_id === customId;
  } catch (e) {
    throw new Error(e);
  }
}

export function taskInPathMatchesAnyId(taskPath: string, id: string): boolean {
  try {
    const manager = new StateManager(taskPath);
    const taskData = manager.readSync();
    return taskData.id === id || taskData.custom_id === id;
  } catch (e) {
    throw new Error(e);
  }
}

export function pathEndsOnJson(path: string): boolean {
  return path.endsWith('.json');
}

export function getTaskDateObject(sInputDate: string, timeZone: string): Date {
  return parseFromTimeZone(sInputDate, { timeZone });
}

export function validateAndGetTaskDate(
  sInputDate: string,
  timeZone: string
): { date: Date; dateString: string } {
  const dDate = getTaskDateObject(sInputDate, timeZone);
  return { date: dDate, dateString: dDate.toISOString() };
}

export function ensureIsTaskArray(a: Fuse.FuseResult<Task>[] | Task[]): Task[] {
  const b: Task[] = [];

  if (!a.length) {
    return a as Task[];
  }

  if (a[0].hasOwnProperty('refIndex')) {
    for (const i in a) {
      b.push((a as unknown as Fuse.FuseResult<Task>)[i].item);
    }
    return b;
  }

  return a as Task[];
}
