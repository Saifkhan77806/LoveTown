import cron from "node-cron";

const jobs = new Map();

export function scheduleJob(jobId, hoursFromNow, callback) {
  const targetDate = addHoursToNow(hoursFromNow);
  const cronTime = dateToCronTime(targetDate);

  const task = cron.schedule(cronTime, () => {
    callback();
    task.stop();
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

function addHoursToNow(hours) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

function dateToCronTime(date) {
  const sec = date.getSeconds();
  const min = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;

  return `${sec} ${min} ${hour} ${day} ${month} *`;
}
