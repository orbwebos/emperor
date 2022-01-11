export const contexts = ['personal', 'social', 'work', 'hobbies', 'other'];

export const enum TaskContext {
  Personal = 'personal',
  Social = 'social',
  Work = 'work',
  Hobbies = 'hobbies',
  Other = 'other',
}

export function expandContextCode(taskContext: TaskContext): string {
  switch (taskContext) {
  case TaskContext.Personal:
    return 'Personal';
  case TaskContext.Social:
    return 'Social';
  case TaskContext.Work:
    return 'Work';
  case TaskContext.Hobbies:
    return 'Hobbies';
  case TaskContext.Other:
    return 'Other';
  default:
    throw new Error(`Invalid context code for expansion to string: ${taskContext}`);
  }
}
