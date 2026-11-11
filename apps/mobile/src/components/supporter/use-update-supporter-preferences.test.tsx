// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ProfileService } from "@repo/wrapper/server";
import type {
  ProfileResponseDto,
  SupporterPreferencesResponseDto,
} from "../../../../../packages/wrapper/src/server";
import { useUpdateSupporterPreferences } from "../../../../../packages/ui/src/components/supporter/hooks/useUpdateSupporterPreferences";
import { DEFAULT_SUPPORTER_PREFERENCES } from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";

const mocks = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);

const PROFILE_KEY = ["userProfile", "user-1"];

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function seedProfile(client: QueryClient, prefs = DEFAULT_SUPPORTER_PREFERENCES) {
  const profile = {
    userId: "user-1",
    username: "alice",
    isSupporter: true,
    supporterPreferences: { ...prefs },
  } as unknown as ProfileResponseDto;

  client.setQueryData(PROFILE_KEY, profile);

  return profile;
}

function readPreferences(client: QueryClient) {
  return client.getQueryData<ProfileResponseDto>(PROFILE_KEY)
    ?.supporterPreferences;
}

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    { status, statusText: "", url: "/v1/profile/supporter-preferences", body: null, ok: false },
    "preferences error",
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "user-1";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useUpdateSupporterPreferences", () => {
  it("merges the patch into the profile cache before the server answers", async () => {
    const client = createClient();
    seedProfile(client);
    const pending = deferred<SupporterPreferencesResponseDto>();
    const request = vi
      .spyOn(ProfileService, "supporterPreferencesControllerUpdateV1")
      .mockReturnValue(pending.promise as never);

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });

    await waitFor(() => {
      expect(readPreferences(client)?.showBadge).toBe(false);
    });
    expect(readPreferences(client)?.showSupporterTheme).toBe(true);
    expect(request).toHaveBeenCalledWith({ showBadge: false });

    pending.resolve({ ...DEFAULT_SUPPORTER_PREFERENCES, showBadge: false });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  });

  it("replaces the preferences with the server's full result", async () => {
    const client = createClient();
    seedProfile(client);
    const serverResult: SupporterPreferencesResponseDto = {
      ...DEFAULT_SUPPORTER_PREFERENCES,
      showBadge: false,
      showSupporterTheme: false,
      titleKey: "patron",
    };
    vi.spyOn(
      ProfileService,
      "supporterPreferencesControllerUpdateV1",
    ).mockResolvedValue(serverResult);

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });

    await waitFor(() => {
      expect(readPreferences(client)).toEqual(serverResult);
    });
  });

  it("rolls back only the failed patch fields, keeping a concurrent successful change", async () => {
    const client = createClient();
    seedProfile(client);
    const failed = deferred<SupporterPreferencesResponseDto>();
    const succeeded = deferred<SupporterPreferencesResponseDto>();
    const request = vi
      .spyOn(ProfileService, "supporterPreferencesControllerUpdateV1")
      .mockReturnValueOnce(failed.promise as never)
      .mockReturnValueOnce(succeeded.promise as never);

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    act(() => {
      hook.result.current.mutate({ showSupporterTheme: false });
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    succeeded.resolve({
      ...DEFAULT_SUPPORTER_PREFERENCES,
      showSupporterTheme: false,
    });
    await waitFor(() => {
      expect(readPreferences(client)?.showSupporterTheme).toBe(false);
    });

    failed.reject(apiError(400));
    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalled();
    });

    // showBadge returns to its previous value; the successful theme change stays.
    expect(readPreferences(client)?.showBadge).toBe(true);
    expect(readPreferences(client)?.showSupporterTheme).toBe(false);
  });

  it("shows the not-supporter message and refreshes profile and billing on 403", async () => {
    const client = createClient();
    seedProfile(client);
    vi.spyOn(
      ProfileService,
      "supporterPreferencesControllerUpdateV1",
    ).mockRejectedValue(apiError(403));
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith({
        color: "red",
        message: "supporter.perks.errors.notSupporter",
      });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: PROFILE_KEY });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["billing", "me"],
    });
  });

  it("invalidates the wall only when showOnSupportersWall changed", async () => {
    const client = createClient();
    seedProfile(client);
    vi.spyOn(
      ProfileService,
      "supporterPreferencesControllerUpdateV1",
    ).mockResolvedValue(DEFAULT_SUPPORTER_PREFERENCES);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["supporters", "wall"],
    });

    act(() => {
      hook.result.current.mutate({ showOnSupportersWall: false });
    });

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["supporters", "wall"],
      });
    });
  });

  it("removes the presence query only when showLiveProfile changed", async () => {
    const client = createClient();
    seedProfile(client);
    vi.spyOn(
      ProfileService,
      "supporterPreferencesControllerUpdateV1",
    ).mockResolvedValue(DEFAULT_SUPPORTER_PREFERENCES);
    const remove = vi.spyOn(client, "removeQueries");

    const hook = renderHook(() => useUpdateSupporterPreferences(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.mutate({ showBadge: false });
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(remove).not.toHaveBeenCalledWith({
      queryKey: ["profile", "presence", "user-1"],
    });

    act(() => {
      hook.result.current.mutate({ showLiveProfile: true });
    });

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith({
        queryKey: ["profile", "presence", "user-1"],
      });
    });
  });
});
