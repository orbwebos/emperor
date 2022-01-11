export const enum TaskStatus {
  TODO = 'TODO',
  DONE = 'DONE',
  DELEGATED = 'DELEGATED',
  FEEDBACK = 'FEEDBACK',
}

export function expandStatusCode(statusCode: TaskStatus): string {
  switch (statusCode) {
  case TaskStatus.TODO:
    return 'To do';
  case TaskStatus.DONE:
    return 'Done';
  case TaskStatus.DELEGATED:
    return 'Delegated';
  case TaskStatus.FEEDBACK:
    return 'Looking for feedback';
  default:
    throw new Error(`Invalid status code for expansion to string: ${statusCode}`);
  }
}
