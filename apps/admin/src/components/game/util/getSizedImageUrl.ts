export enum ImageSize {
    COVER_SMALL = "cover_small",
    COVER_BIG = "cover_big",
    SCREENSHOT_MED = "screenshot_med",
    SCREENSHOT_BIG = "screenshot_big",
    SCREENSHOT_HUGE = "screenshot_huge",
    THUMB = "thumb",
    MICRO = "micro",
    HD = "720p",
    FULL_HD = "1080p",
}

function replaceSize(url: string, newSize: string): string {
    let urlToUse = structuredClone(url.trim());
    if (urlToUse.startsWith("//")) {
        urlToUse = "https:" + urlToUse;
    }
    const pattern =
        /(https:\/\/images\.igdb\.com\/igdb\/image\/upload\/t_)(\w+)(\/[a-zA-Z0-9]*\.jpg)/;
    const match = urlToUse.match(pattern);
    if (match) {
        return `${match[1]}${newSize}${match[3]}`;
    } else {
        return "URL does not match the expected pattern";
    }
}

export function getSizedImageUrl(
    imageUrl: string | undefined,
    size: ImageSize,
) {
    if (imageUrl) {
        return replaceSize(imageUrl, size);
    }

    return undefined;
}
