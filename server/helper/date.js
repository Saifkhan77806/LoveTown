export function getFutureDate(value) {
  const date = new Date();

  if (process.env.ENVIRONMENT === "PRODUCTION") {
    // Production → add HOURS
    date.setHours(date.getHours() + value);
  } else {
    // Non-prod (dev / staging / local) → add MINUTES
    date.setMinutes(date.getMinutes() + value);
  }

  return date;
}
