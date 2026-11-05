/** Formats a puzzle day ("YYYY-MM-DD") without shifting it by the local time zone. */
export const formatDailyDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale || "en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
