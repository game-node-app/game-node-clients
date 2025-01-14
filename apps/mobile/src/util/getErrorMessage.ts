import { ApiError as SearchAPIError } from "@/wrapper/search";
import { ApiError as ServerAPIError, type ApiError } from "@/wrapper/server";

export function getErrorMessage(err: Error | ApiError): string {
    if (err instanceof SearchAPIError || err instanceof ServerAPIError) {
        if (err.body && err.body.message) {
            return err.body.message;
        }
    }

    return err.message;
}
