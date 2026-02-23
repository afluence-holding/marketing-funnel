import { schedule, validate, type ScheduledTask } from 'node-cron';

interface JobDefinition {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled?: boolean;
}

const registeredJobs = new Map<string, ScheduledTask>();

export function registerJob(job: JobDefinition) {
  if (job.enabled === false) {
    console.log(`[cron] Skipping disabled job: ${job.name}`);
    return;
  }

  if (!validate(job.schedule)) {
    console.error(`[cron] Invalid schedule for "${job.name}": ${job.schedule}`);
    return;
  }

  const task = schedule(job.schedule, async () => {
    const start = Date.now();
    console.log(`[cron] Running: ${job.name}`);
    try {
      await job.handler();
      console.log(`[cron] Done: ${job.name} (${Date.now() - start}ms)`);
    } catch (err) {
      console.error(`[cron] Failed: ${job.name}`, err);
    }
  }, { name: job.name });

  task.stop();
  registeredJobs.set(job.name, task);
  console.log(`[cron] Registered: ${job.name} (${job.schedule})`);
}

export function startAll() {
  for (const [name, task] of registeredJobs) {
    task.start();
    console.log(`[cron] Started: ${name}`);
  }
}

export function stopAll() {
  for (const [name, task] of registeredJobs) {
    task.stop();
    console.log(`[cron] Stopped: ${name}`);
  }
}

export function getRegisteredJobs() {
  return Array.from(registeredJobs.keys());
}
