import { afterEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  value: { data: null as { user: { id: string } } | null, isPending: false },
}));
vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => session.value },
}));

import { useUserId } from "../../../../packages/ui/src/components/auth/hooks/useUserId";
import {
  PROJECT_CONTEXT,
  setProjectContext,
} from "../../../../packages/ui/src/util/projectContext";

const withDebugUser = (debugUserId?: string) =>
  setProjectContext({
    client: "web",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
    debugUserId,
  });

describe("debug user id", () => {
  const original = PROJECT_CONTEXT;
  afterEach(() => setProjectContext(original));

  it("is used only when nobody is signed in and the session has loaded", () => {
    withDebugUser("debug-user");

    session.value = { data: null, isPending: false };
    expect(useUserId()).toBe("debug-user");

    session.value = { data: null, isPending: true };
    expect(useUserId()).toBeUndefined();

    session.value = { data: { user: { id: "real-user" } }, isPending: false };
    expect(useUserId()).toBe("real-user");
  });

  it("changes nothing when not configured", () => {
    withDebugUser(undefined);
    session.value = { data: null, isPending: false };
    expect(useUserId()).toBeUndefined();
  });
});
