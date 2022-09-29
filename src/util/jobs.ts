import { scheduledJobs } from 'node-schedule';

export function unloadJobsStartingWith(prefix: string): void {
  Object.entries(scheduledJobs).forEach(([name, job]) => {
    if (name.startsWith(prefix)) {
      job.cancel();
    }
  });
}
