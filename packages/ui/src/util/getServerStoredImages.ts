import { OpenAPI as ServerOpenAPI } from "../../../wrapper/src/server";
import { PROJECT_CONTEXT } from "#@/util/projectContext.ts";

export function getS3StoredUpload(filenameWithExtension: string) {
  const bucket = PROJECT_CONTEXT?.s3BucketUrl || "";
  return bucket ? `${bucket}/${filenameWithExtension}` : filenameWithExtension;
}

/**
 * Extension '.png' is appended by default at the end of filename.
 * @param iconName
 */
export function getServerStoredIcon(iconName: string) {
  return `${ServerOpenAPI.BASE}/v1/public/icons/${iconName}.png`;
}
