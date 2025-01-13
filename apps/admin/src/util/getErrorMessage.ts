import { ApiError as SearchAPIError } from "@/wrapper/search";
import { ApiError as ServerAPIError } from "@/wrapper/server";
import { type ApiError } from "@/wrapper/server";

export function getErrorMessage(err: Error | ApiError): string {
    if (err instanceof SearchAPIError || err instanceof ServerAPIError) {
        if (err.body && err.body.message) {
            return err.body.message;
        }
    }

    return err.message;
}
