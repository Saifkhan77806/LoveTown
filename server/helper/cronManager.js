import cron from "node-cron";

const jobs = new Map();

export function scheduleJob(jobId, hoursFromNow, callback) {
  const targetDate = getTargetDate(hoursFromNow);
  const cronTime = dateToCronTime(targetDate);

  console.log("cron job is scheduled");
  const task = cron.schedule(cronTime, () => {
    callback();
    task.stop();
    jobs.delete(jobId);
  });

  jobs.set(jobId, task);
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

/* ───────────────────────────────
   ENV-AWARE DATE GENERATION
   ─────────────────────────────── */
function getTargetDate(hoursFromNow) {
  const date = new Date();

  if (process.env.ENVIRONMENT === "PRODUCTION") {
    // Use hours in prod
    date.setHours(date.getHours() + hoursFromNow);
    console.log("it will execute after an hour or hours");
  } else {
    // Use minutes in dev (1 hour = 1 minute)
    date.setMinutes(date.getMinutes() + hoursFromNow);
    console.log("it will execute after an minute or minute");
  }

  return new Date(date.getTime() + 60 * 1000); // +1 minute buffer
}

/* ───────────────────────────────
   CRON TIME GENERATION
   ─────────────────────────────── */
function dateToCronTime(date) {
  const sec = date.getSeconds();
  const min = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;

  return `${sec} ${min} ${hour} ${day} ${month} *`;
}
