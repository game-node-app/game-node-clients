import { serverUrl } from "@/util/constants";

export function getServerStoredUpload(filenameWithExtension: string) {
    return `${serverUrl}/v1/public/uploads/${filenameWithExtension}`;
}

/**
 * Extension '.png' is appended by default at the end of filename.
 * @param iconName
 */
export function getServerStoredIcon(iconName: string) {
    return `${serverUrl}/v1/public/icons/${iconName}.png`;
}
