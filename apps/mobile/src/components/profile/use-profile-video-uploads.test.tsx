// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import {
  focusManager,
  notifyManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  ProfileResponseDto,
  ProfileService,
  ProfileVideoUploadResponseDto,
  ProfileVideoUploadsResponseDto,
} from "@repo/wrapper/server";
import { useProfileVideoUploads } from "../../../../../packages/ui/src/components/profile/hooks/useProfileVideoUploads";

const session = vi.hoisted(() => ({ id: undefined as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "ProfileVideoUploadsQueryClientWrapper";
  return Wrapper;
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Mirror web's transactional defaults to prove the hook overrides them.
        staleTime: Infinity,
        refetchOnMount: false,
      },
    },
  });
}

const profile = (
  videoUploads?: ProfileVideoUploadsResponseDto,
): ProfileResponseDto => ({
  customCoverMode: ProfileResponseDto.customCoverMode.ANY,
  isSupporter: false,
  supporterPreferences: null,
  userId: "user-1",
  username: "tester",
  bio: "",
  avatar: null,
  banner: null,
  avatarVideo: null,
  bannerVideo: null,
  usernameLastUpdatedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...(videoUploads ? { videoUploads } : {}),
});

const uploadsWith = (
  avatar: ProfileVideoUploadsResponseDto["avatar"],
  banner: ProfileVideoUploadsResponseDto["banner"] = null,
): ProfileVideoUploadsResponseDto => ({ avatar, banner });

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  focusManager.setFocused(undefined);
  session.id = undefined;
});

describe("useProfileVideoUploads", () => {
  it("stays disabled without a userId and uses the owner query key with fresh reads", async () => {
    const client = createClient();
    const findOwn = vi
      .spyOn(ProfileService, "profileControllerFindOwnV1")
      .mockResolvedValue(profile(uploadsWith(null)));

    const hook = renderHook(() => useProfileVideoUploads(), {
      wrapper: createWrapper(client),
    });

    expect(findOwn).not.toHaveBeenCalled();
    expect(hook.result.current.queryKey).toEqual([
      "userProfile",
      undefined,
      "own",
    ]);
    expect(hook.result.current.isPending).toBe(true);

    session.id = "user-1";
    hook.rerender();

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(findOwn).toHaveBeenCalledTimes(1);
    expect(hook.result.current.queryKey).toEqual([
      "userProfile",
      "user-1",
      "own",
    ]);

    const query = client
      .getQueryCache()
      .find({ queryKey: ["userProfile", "user-1", "own"] });
    const options = query?.options as unknown as
      | {
          staleTime?: unknown;
          refetchOnMount?: unknown;
        }
      | undefined;
    expect(options?.staleTime).toBe(0);
    expect(options?.refetchOnMount).toBe("always");
  });

  it("polls only while a slot is processing and invalidates the profile when it becomes ready", async () => {
    vi.useFakeTimers();
    // React Query batches observer notifications on a 0ms timer; run them
    // synchronously so `act` flushes the hook result in fake-timer tests.
    notifyManager.setScheduler((callback) => callback());
    focusManager.setFocused(true);
    session.id = "user-1";

    const client = createClient();
    const findOwn = vi
      .spyOn(ProfileService, "profileControllerFindOwnV1")
      .mockResolvedValueOnce(
        profile(
          uploadsWith({
            status: ProfileVideoUploadResponseDto.status.PROCESSING,
            errorCode: null,
          }),
        ),
      )
      .mockResolvedValue(
        profile(
          uploadsWith({
            status: ProfileVideoUploadResponseDto.status.READY,
            errorCode: null,
          }),
        ),
      );
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const flush = async (ms = 0) => {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
    };

    const hook = renderHook(() => useProfileVideoUploads(), {
      wrapper: createWrapper(client),
    });

    await flush();
    expect(findOwn).toHaveBeenCalledTimes(1);
    expect(hook.result.current.data?.videoUploads?.avatar?.status).toBe(
      "processing",
    );

    // The processing slot schedules a 3s poll, which reports ready.
    await flush(3000);
    await flush();
    await flush();

    expect(findOwn.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(hook.result.current.data?.videoUploads?.avatar?.status).toBe(
      "ready",
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["userProfile", "user-1"],
    });

    // The ready transition invalidates the profile, which refetches the owner
    // query too. Let that settle, then prove polling stopped.
    await flush();
    const callsAfterReady = findOwn.mock.calls.length;

    await flush(9000);

    expect(findOwn).toHaveBeenCalledTimes(callsAfterReady);
  });

  it("does not poll when no slot is processing", async () => {
    vi.useFakeTimers();
    focusManager.setFocused(true);
    session.id = "user-1";

    const client = createClient();
    const findOwn = vi
      .spyOn(ProfileService, "profileControllerFindOwnV1")
      .mockResolvedValue(
        profile(
          uploadsWith(
            {
              status: ProfileVideoUploadResponseDto.status.FAILED,
              errorCode:
                ProfileVideoUploadResponseDto.errorCode.CONVERSION_FAILED,
            },
            {
              status: ProfileVideoUploadResponseDto.status.READY,
              errorCode: null,
            },
          ),
        ),
      );

    renderHook(() => useProfileVideoUploads(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(findOwn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });

    expect(findOwn).toHaveBeenCalledTimes(1);
  });
});
