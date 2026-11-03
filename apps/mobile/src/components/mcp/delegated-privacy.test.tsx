// @vitest-environment jsdom
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PostHogProvider } from "../../../../../packages/analytics/src/PostHogProvider";
const mocks = vi.hoisted(() => ({ init: vi.fn(), register: vi.fn() }));
vi.mock("posthog-js", () => ({ default: mocks }));
vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock(
  "../../../../../packages/analytics/src/hooks/usePostHogUserListener",
  () => ({ usePostHogUserListener: () => {} }),
);
afterEach(cleanup);
it("blocks delegated recording and masks connection auth network payloads", () => {
  render(
    <PostHogProvider
      appName="test"
      posthogKey="test"
      posthogHost="https://example.test"
    />,
  );
  const config = mocks.init.mock.calls[0][1];
  expect(config.session_recording.blockSelector).toBe(".oauth-private");
  const mask = config.session_recording.maskCapturedNetworkRequestFn;
  for (const endpoint of ["init", "callback"]) {
    expect(
      mask({
        name: `https://api.example.test/v1/connections/gog/auth/${endpoint}`,
        body: { code: "fake-one-use-code" },
      }),
    ).toBeNull();
  }
  const normal = { name: "https://api.example.test/v1/connections/own" };
  expect(mask(normal)).toBe(normal);
});
