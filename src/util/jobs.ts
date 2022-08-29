import { scheduledJobs } from 'node-schedule';

export function unloadJobsStartingWith(s: string): void {
  Object.entries(scheduledJobs).forEach(([name, job]) => {
    if (name.startsWith(s)) job.cancel();
  });
}
