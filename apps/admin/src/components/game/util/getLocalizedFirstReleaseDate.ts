export function getLocalizedFirstReleaseDate(
    date: string | undefined,
    locale?: string,
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
    });
}
