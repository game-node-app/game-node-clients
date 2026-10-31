import { ApiError as SearchAPIError } from "@repo/wrapper/search";
import { ApiError as ServerAPIError } from "@repo/wrapper/server";

export function getErrorMessage(err: unknown): string {
  if (err instanceof SearchAPIError || err instanceof ServerAPIError) {
    if (typeof err.body?.message === "string") {
      return err.body.message;
    }
    if (
      Array.isArray(err.body?.message) &&
      err.body.message.every((message: unknown) => typeof message === "string")
    ) {
      return err.body.message.join("\n");
    }
  }

  return typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
    ? err.message
    : "";
}
