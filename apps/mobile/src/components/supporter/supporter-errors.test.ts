import { expect, it } from "vitest";
import { ApiError } from "@repo/wrapper/server";
import { getSupporterErrorKind } from "../../../../../packages/ui/src/components/supporter/util/supporterErrors";

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/billing/me",
      body: null,
      ok: false,
    },
    "billing error",
  );
}

it("maps 401, 404, 409 and 503 to the supporter error kinds", () => {
  expect(getSupporterErrorKind(apiError(401))).toBe("unauthorized");
  expect(getSupporterErrorKind(apiError(404))).toBe("notFound");
  expect(getSupporterErrorKind(apiError(409))).toBe("conflict");
  expect(getSupporterErrorKind(apiError(503))).toBe("unavailable");
});

it("maps network failures and leaves everything else unknown", () => {
  expect(getSupporterErrorKind(apiError(0))).toBe("network");
  expect(getSupporterErrorKind(new TypeError("Failed to fetch"))).toBe(
    "network",
  );
  expect(getSupporterErrorKind(apiError(500))).toBe("unknown");
  expect(getSupporterErrorKind(new Error("boom"))).toBe("unknown");
  expect(getSupporterErrorKind(undefined)).toBe("unknown");
  expect(getSupporterErrorKind("503")).toBe("unknown");
});
