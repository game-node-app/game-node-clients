// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ProfileResponseDto,
  ProfileService,
  ProfileVideoUploadResponseDto,
  ProfileVideoUploadsResponseDto,
} from "@repo/wrapper/server";
import { ProfileVideoUploadStatus } from "../../../../../packages/ui/src/components/profile/edit/ProfileVideoUploadStatus";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

const OWNER_QUERY_KEY = ["userProfile", "user-1", "own"];

const profileWith = (
  videoUploads: ProfileVideoUploadsResponseDto,
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
  videoUploads,
});

const uploadsWith = (
  avatar: ProfileVideoUploadsResponseDto["avatar"],
  banner: ProfileVideoUploadsResponseDto["banner"] = null,
): ProfileVideoUploadsResponseDto => ({ avatar, banner });

const processing = () => ({
  status: ProfileVideoUploadResponseDto.status.PROCESSING,
  errorCode: null,
});

const failedWith = (
  errorCode: ProfileVideoUploadResponseDto.errorCode,
): ProfileVideoUploadsResponseDto["avatar"] => ({
  status: ProfileVideoUploadResponseDto.status.FAILED,
  errorCode,
});

function renderStatus(
  slot: "avatar" | "banner",
  videoUploads: ProfileVideoUploadsResponseDto,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const findOwn = vi
    .spyOn(ProfileService, "profileControllerFindOwnV1")
    .mockResolvedValue(profileWith(videoUploads));

  const view = render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <ProfileVideoUploadStatus slot={slot} />
      </QueryClientProvider>
    </MantineProvider>,
  );

  return { ...view, client, findOwn };
}

async function waitForOwnerQuery(client: QueryClient) {
  await waitFor(() =>
    expect(client.getQueryState(OWNER_QUERY_KEY)?.status).toBe("success"),
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ProfileVideoUploadStatus", () => {
  it("renders nothing when the slot has no upload attempt", async () => {
    const { client } = renderStatus("avatar", uploadsWith(null));

    await waitForOwnerQuery(client);

    expect(screen.queryByTestId("profile-video-status-avatar")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a loader and the processing message while the slot is processing", async () => {
    renderStatus("avatar", uploadsWith(processing()));

    const status = await screen.findByTestId("profile-video-status-avatar");

    expect(status.textContent).toContain("profileVideo.status.processing");
    expect(screen.getByRole("status")).toBe(status);
    expect(status.querySelector('[class*="Loader"]')).not.toBeNull();
  });

  it("shows a brief confirmation when the slot is ready", async () => {
    renderStatus(
      "avatar",
      uploadsWith({
        status: ProfileVideoUploadResponseDto.status.READY,
        errorCode: null,
      }),
    );

    const status = await screen.findByTestId("profile-video-status-avatar");

    expect(status.textContent).toContain("profileVideo.status.ready");
    expect(status.querySelector('[class*="Loader"]')).toBeNull();
  });

  it("reads only the requested slot", async () => {
    const uploads = uploadsWith(
      processing(),
      failedWith(ProfileVideoUploadResponseDto.errorCode.TIMEOUT),
    );

    renderStatus("banner", uploads);

    const status = await screen.findByTestId("profile-video-status-banner");

    expect(status.textContent).toContain("profileVideo.status.errors.timeout");
    expect(screen.queryByTestId("profile-video-status-avatar")).toBeNull();
  });

  const errorCases: ReadonlyArray<
    [ProfileVideoUploadResponseDto.errorCode, string]
  > = [
    [
      ProfileVideoUploadResponseDto.errorCode.CONVERSION_FAILED,
      "profileVideo.status.errors.conversion_failed",
    ],
    [
      ProfileVideoUploadResponseDto.errorCode.OUTPUT_TOO_LARGE,
      "profileVideo.status.errors.output_too_large",
    ],
    [
      ProfileVideoUploadResponseDto.errorCode.UPLOAD_FAILED,
      "profileVideo.status.errors.upload_failed",
    ],
    [
      ProfileVideoUploadResponseDto.errorCode.SOURCE_MISSING,
      "profileVideo.status.errors.source_missing",
    ],
    [
      ProfileVideoUploadResponseDto.errorCode.TIMEOUT,
      "profileVideo.status.errors.timeout",
    ],
  ];

  it.each(errorCases)(
    "maps the %s error code to its localized message",
    async (errorCode, messageKey) => {
      renderStatus("avatar", uploadsWith(failedWith(errorCode)));

      const status = await screen.findByTestId("profile-video-status-avatar");

      expect(status.textContent).toContain(messageKey);
      expect(screen.getByRole("alert")).toBe(status);
    },
  );

  it("falls back to the unknown message for an unmapped error code", async () => {
    renderStatus(
      "avatar",
      uploadsWith(
        failedWith(
          "not_a_server_code" as ProfileVideoUploadResponseDto.errorCode,
        ),
      ),
    );

    const status = await screen.findByTestId("profile-video-status-avatar");

    expect(status.textContent).toContain("profileVideo.status.errors.unknown");
  });
});
