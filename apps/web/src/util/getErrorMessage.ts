import { ApiError as SearchAPIError } from "@repo/wrapper/search";
import { ApiError as ServerAPIError } from "@repo/wrapper/server";
import { type ApiError } from "@repo/wrapper/server";

export function getErrorMessage(err: Error | ApiError): string {
  if (err instanceof SearchAPIError || err instanceof ServerAPIError) {
    if (err.body && err.body.message) {
      return err.body.message;
    }
  }

  return err.message;
}
