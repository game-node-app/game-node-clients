import { ApiError as SearchAPIError } from "../../../wrapper/src/search";
import { ApiError as ServerAPIError } from "../../../wrapper/src/server";
import { type ApiError } from "../../../wrapper/src/server";

export function getErrorMessage(err: Error | ApiError): string {
  if (err instanceof SearchAPIError || err instanceof ServerAPIError) {
    if (err.body && err.body.message) {
      return err.body.message;
    }
  }

  return err.message;
}
