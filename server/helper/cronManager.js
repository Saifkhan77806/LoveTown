import cron from 'node-cron'

const jobs = new Map(); // Key: jobId, Value: cronTask

export function scheduleJob(jobId, date, callback) {
  const time = dateToCronTime(date);
  const task = cron.schedule(time, () => {
    callback();
    task.stop(); // Auto-cleanup after execution
    jobs.delete(jobId);
  });

  jobs.set(jobId, task);
  return true;
}

export function cancelJob(jobId) {
  const task = jobs.get(jobId);
  if (task) {
    task.stop();
    jobs.delete(jobId);
    return true;
  }
  return false;
}

export function getAllJobs() {
  return Array.from(jobs.keys());
}

function dateToCronTime(date) {
  const sec = date.getSeconds();
  const min = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1; // cron months are 1-12

  return `${sec} ${min} ${hour} ${day} ${month} *`;
}
