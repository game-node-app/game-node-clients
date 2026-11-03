import dayjs from "dayjs";

/**
 * A release date as the local day it names: the API sends dates as UTC midnight,
 * which plain parsing turns into the previous day west of UTC.
 */
export function getReleaseDay(date: string) {
  return dayjs(date.slice(0, 10));
}

export function getLocalizedFirstReleaseDate(
  date: string | undefined,
  locale: string = "en-US",
) {
  if (!date) {
    return null;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    // UTC midnight, see getReleaseDay
    timeZone: "UTC",
  });
}
