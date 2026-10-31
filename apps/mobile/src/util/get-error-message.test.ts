import { describe, expect, it } from "vitest";
import { ApiError as ServerError } from "@repo/wrapper/server";
import { ApiError as SearchError } from "@repo/wrapper/search";
import { getErrorMessage } from "../../../../packages/ui/src/util/getErrorMessage";

describe("shared error messages", () => {
  it("preserves server and search API messages", () => {
    for (const ErrorType of [ServerError, SearchError]) {
      const error = new ErrorType(
        { method: "GET", url: "/test" },
        {
          url: "/test",
          ok: false,
          status: 400,
          statusText: "Bad Request",
          body: { message: "API detail" },
        },
        "HTTP error",
      );
      expect(getErrorMessage(error)).toBe("API detail");
      const validationError = new ErrorType(
        { method: "GET", url: "/test" },
        {
          url: "/test",
          ok: false,
          status: 400,
          statusText: "Bad Request",
          body: { message: ["First", "Second"] },
        },
        "HTTP error",
      );
      expect(getErrorMessage(validationError)).toBe("First\nSecond");
    }
  });

  it("keeps ordinary errors and lets callers localize unknown failures", () => {
    expect(getErrorMessage(new Error("Failure"))).toBe("Failure");
    expect(getErrorMessage({ message: "Structured failure" })).toBe(
      "Structured failure",
    );
    expect(getErrorMessage(null)).toBe("");
    expect(getErrorMessage({ message: 123 })).toBe("");
  });
});
