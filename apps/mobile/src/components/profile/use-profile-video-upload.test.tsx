// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  ProfileService,
  UploadProfileVideoResponseDto,
} from "@repo/wrapper/server";
import {
  PROFILE_VIDEO_UPLOAD_MESSAGES,
  ProfileVideoUploadError,
  useProfileVideoUpload,
} from "../../../../../packages/ui/src/components/profile/hooks/useProfileVideoUpload";

const session = vi.hoisted(() => ({ id: "user-1" as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "ProfileVideoUploadQueryClientWrapper";
  return Wrapper;
}

const apiError = (status: number) =>
  new ApiError(
    {
      method: "PUT",
      url: "/v1/profile/video",
    } as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      url: "/v1/profile/video",
      ok: false,
      status,
      statusText: "Error",
      body: { message: `server ${status}` },
    },
    `server ${status}`,
  );

const uploadAccepted = () =>
  vi
    .spyOn(ProfileService, "profileVideoControllerUploadV1")
    .mockResolvedValue({} as UploadProfileVideoResponseDto);

const uploadRejected = (status: number) =>
  vi
    .spyOn(ProfileService, "profileVideoControllerUploadV1")
    .mockRejectedValue(apiError(status));

const variables = {
  file: new Blob(["video"], { type: "video/mp4" }),
  type: "avatar" as const,
  crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.6 },
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.id = "user-1";
});

describe("useProfileVideoUpload", () => {
  it("sends the crop fields and treats 202 as processing", async () => {
    const client = new QueryClient({ defaultOptions: { mutations: {} } });
    const upload = uploadAccepted();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      const result = await hook.result.current.mutateAsync(variables);
      expect(result).toEqual({
        alreadyProcessing: false,
        messageKey: PROFILE_VIDEO_UPLOAD_MESSAGES.accepted,
      });
    });

    expect(upload).toHaveBeenCalledWith({
      file: variables.file,
      type: "avatar",
      cropX: 0.1,
      cropY: 0.2,
      cropWidth: 0.5,
      cropHeight: 0.6,
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["userProfile", "user-1", "own"],
    });
  });

  it("omits crop fields when the video could not be previewed", async () => {
    const client = new QueryClient();
    const upload = uploadAccepted();

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await hook.result.current.mutateAsync({
        file: variables.file,
        type: "banner",
      });
    });

    expect(upload).toHaveBeenCalledWith({
      file: variables.file,
      type: "banner",
      cropX: undefined,
      cropY: undefined,
      cropWidth: undefined,
      cropHeight: undefined,
    });
  });

  it("keeps tracking on 409 without reporting an error", async () => {
    const client = new QueryClient();
    uploadRejected(409);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      const result = await hook.result.current.mutateAsync(variables);
      expect(result).toEqual({
        alreadyProcessing: true,
        messageKey: PROFILE_VIDEO_UPLOAD_MESSAGES.alreadyProcessing,
      });
    });

    expect(hook.result.current.isError).toBe(false);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["userProfile", "user-1", "own"],
    });
  });

  it.each([
    [400, PROFILE_VIDEO_UPLOAD_MESSAGES.invalidFile],
    [403, PROFILE_VIDEO_UPLOAD_MESSAGES.forbidden],
    [413, PROFILE_VIDEO_UPLOAD_MESSAGES.tooLarge],
    [429, PROFILE_VIDEO_UPLOAD_MESSAGES.throttled],
    [500, PROFILE_VIDEO_UPLOAD_MESSAGES.failed],
    [418, PROFILE_VIDEO_UPLOAD_MESSAGES.failed],
  ])("maps a %i response to its locale key", async (status, messageKey) => {
    const client = new QueryClient();
    uploadRejected(status);

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await expect(
        hook.result.current.mutateAsync(variables),
      ).rejects.toMatchObject({
        name: "ProfileVideoUploadError",
        status,
        messageKey,
      });
    });

    await waitFor(() =>
      expect(hook.result.current.error).toBeInstanceOf(ProfileVideoUploadError),
    );
  });

  it("refreshes supporter status when the server answers 403", async () => {
    const client = new QueryClient();
    uploadRejected(403);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(variables).catch(() => undefined);
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["billing", "me"] });
  });

  it("does not refresh supporter status for other rejections", async () => {
    const client = new QueryClient();
    uploadRejected(400);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(variables).catch(() => undefined);
    });

    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["billing", "me"],
    });
  });

  it("maps network failures to the generic message", async () => {
    const client = new QueryClient();
    vi.spyOn(
      ProfileService,
      "profileVideoControllerUploadV1",
    ).mockRejectedValue(new Error("network down"));

    const hook = renderHook(() => useProfileVideoUpload(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await expect(
        hook.result.current.mutateAsync(variables),
      ).rejects.toMatchObject({
        status: null,
        messageKey: PROFILE_VIDEO_UPLOAD_MESSAGES.failed,
      });
    });
  });
});
