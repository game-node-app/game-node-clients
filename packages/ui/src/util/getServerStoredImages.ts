import { OpenAPI as ServerOpenAPI } from "../../../wrapper/src/server";
import { OpenAPI as SearchOpenAPI } from "../../../wrapper/src/search";

export function getServerStoredUpload(filenameWithExtension: string) {
  return `${ServerOpenAPI.BASE}/v1/public/uploads/${filenameWithExtension}`;
}

/**
 * Extension '.png' is appended by default at the end of filename.
 * @param iconName
 */
export function getServerStoredIcon(iconName: string) {
  return `${ServerOpenAPI.BASE}/v1/public/icons/${iconName}.png`;
}
