import { scheduledJobs } from 'node-schedule';

export function unloadJobsStartingWith(s: string): void {
  for (const i in scheduledJobs) {
    if (scheduledJobs[i].name.startsWith(s)) {
      scheduledJobs[i].cancel();
    }
  }
}
