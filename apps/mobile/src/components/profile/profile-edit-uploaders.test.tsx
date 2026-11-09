// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Area } from "react-easy-crop";
import type { FileWithPath } from "@mantine/dropzone";
import { UIProvider, type UIHookRegistry } from "@repo/ui";
import {
  ProfileService,
  UploadProfileVideoResponseDto,
} from "@repo/wrapper/server";
import { ProfileEditAvatarUploader } from "../../../../../packages/ui/src/components/profile/edit/ProfileEditAvatarUploader";
import { ProfileEditBannerUploader } from "../../../../../packages/ui/src/components/profile/edit/ProfileEditBannerUploader";

const mocks = vi.hoisted(() => ({
  /** `null` reproduces the "status still loading" state. */
  isSupporter: true as boolean | null,
  /** A failed status read keeps the image-only dropzone. */
  statusError: false,
  profileInvalidate: vi.fn(),
  dropzoneProps: undefined as Record<string, unknown> | undefined,
  cropperProps: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: undefined,
      isLoading: false,
      invalidate: mocks.profileInvalidate,
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({
    useSupporterStatus: () => {
      if (mocks.statusError) {
        return {
          data: undefined,
          isLoading: false,
          isPending: false,
          isError: true,
          error: new Error("supporter status failed"),
        };
      }

      if (mocks.isSupporter === null) {
        return {
          data: undefined,
          isLoading: true,
          isPending: true,
          isError: false,
        };
      }

      return {
        data: { isSupporter: mocks.isSupporter },
        isLoading: false,
        isPending: false,
        isError: false,
      };
    },
  }),
);

vi.mock(
  "../../../../../packages/ui/src/util/imageUtils",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../packages/ui/src/util/imageUtils")
      >();

    return {
      ...actual,
      getCroppedImg: vi.fn(async () => "data:image/jpeg;base64,cropped"),
    };
  },
);

vi.mock("@mantine/dropzone", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/dropzone")>();

  const MockStatus = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  const MockDropzone = (props: Record<string, unknown>) => {
    mocks.dropzoneProps = props;
    return React.createElement(
      "div",
      { "data-testid": "dropzone" },
      props.children as React.ReactNode,
    );
  };

  return {
    ...actual,
    Dropzone: Object.assign(MockDropzone, {
      Accept: MockStatus,
      Reject: MockStatus,
      Idle: MockStatus,
    }),
  };
});

vi.mock("react-easy-crop", () => {
  const MockCropper = (props: Record<string, unknown>) => {
    mocks.cropperProps = props;
    return React.createElement("div", { "data-testid": "cropper" });
  };

  return { default: MockCropper };
});

type CapturedDropzoneProps = {
  accept: Record<string, string[]>;
  onDrop: (files: FileWithPath[]) => void;
};

type CapturedCropperProps = {
  image?: string;
  video?: string;
  aspect: number;
  minZoom: number;
  onCropComplete: (percentages: Area) => void;
};

const MockLink = ({ children, ...props }: React.ComponentProps<"a">) =>
  React.createElement("a", props, children);

const testQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

/**
 * One provider tree per test, reused by `rerender`, so a test can simulate the
 * supporter status resolving after the uploader first mounted.
 */
const Providers = ({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: React.ReactNode;
}) => (
  <MantineProvider>
    <UIProvider presenters={{ Link: MockLink }} hooks={{} as UIHookRegistry}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UIProvider>
  </MantineProvider>
);

const wrapUploader = (ui: React.ReactElement, queryClient: QueryClient) => (
  <Providers queryClient={queryClient}>{ui}</Providers>
);

function renderUploader(ui: React.ReactElement) {
  return render(wrapUploader(ui, testQueryClient()));
}

const dropzoneProps = () =>
  mocks.dropzoneProps as unknown as CapturedDropzoneProps;
const cropperProps = () =>
  mocks.cropperProps as unknown as CapturedCropperProps | undefined;

const dropFile = (file: File) => {
  act(() => {
    dropzoneProps().onDrop([file as FileWithPath]);
  });
};

const mp4File = () => new File(["video"], "clip.mp4", { type: "video/mp4" });

const mockUploadAccepted = () =>
  vi
    .spyOn(ProfileService, "profileVideoControllerUploadV1")
    .mockResolvedValue({} as UploadProfileVideoResponseDto);

beforeEach(() => {
  mocks.isSupporter = true;
  mocks.statusError = false;
  mocks.dropzoneProps = undefined;
  mocks.cropperProps = undefined;
  mocks.profileInvalidate.mockReset();

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:preview"),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProfileEditAvatarUploader", () => {
  it("rejects a GIF before any crop or upload", () => {
    renderUploader(<ProfileEditAvatarUploader />);

    expect(mocks.isSupporter).toBe(true);
    dropFile(new File(["gif"], "avatar.gif", { type: "image/gif" }));

    expect(screen.getByTestId("profile-upload-error").textContent).toBe(
      "profileVideo.upload.messages.gifNotSupported",
    );
    expect(cropperProps()).toBeUndefined();
  });

  it("lets a supporter select a video and uploads the normalized crop", async () => {
    const upload = mockUploadAccepted();
    const file = mp4File();

    renderUploader(<ProfileEditAvatarUploader />);

    expect(dropzoneProps().accept).toHaveProperty("video/mp4");
    expect(dropzoneProps().accept).not.toHaveProperty("image/gif");

    dropFile(file);

    const probe = screen.getByTestId("profile-video-probe");
    fireEvent.loadedMetadata(probe);

    expect(cropperProps()?.video).toBe("blob:preview");
    expect(cropperProps()?.aspect).toBe(1);
    expect(cropperProps()?.minZoom).toBe(1);

    act(() => {
      cropperProps()?.onCropComplete({
        x: 10,
        y: 20,
        width: 50,
        height: 25,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));

    expect(screen.getByTestId("profile-video-preview")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledWith({
      file,
      type: "avatar",
      cropX: 0.1,
      cropY: 0.2,
      cropWidth: 0.5,
      cropHeight: 0.25,
    });
  });

  it("does not offer video to a non-supporter and links the supporter screen", () => {
    mocks.isSupporter = false;

    renderUploader(<ProfileEditAvatarUploader />);

    expect(dropzoneProps().accept).not.toHaveProperty("video/mp4");
    expect(dropzoneProps().accept).not.toHaveProperty("image/gif");
    expect(dropzoneProps().accept).toHaveProperty("image/png");
    expect(dropzoneProps().accept).toHaveProperty("image/jpeg");

    const notice = screen.getByTestId("profile-video-supporter-notice");
    expect(notice.textContent).toContain("profileVideo.supporter.title");
    expect(notice.querySelector("a")?.getAttribute("href")).toBe(
      "/home?settings=premium",
    );

    dropFile(mp4File());

    expect(screen.getByTestId("profile-upload-error").textContent).toBe(
      "profileVideo.upload.messages.forbidden",
    );
    expect(screen.queryByTestId("profile-video-probe")).toBeNull();
    expect(cropperProps()).toBeUndefined();
  });

  it("waits for the supporter status before rendering the dropzone", () => {
    mocks.isSupporter = null;

    const queryClient = testQueryClient();
    const { rerender } = render(
      wrapUploader(<ProfileEditAvatarUploader />, queryClient),
    );

    expect(screen.queryByTestId("dropzone")).toBeNull();
    expect(mocks.dropzoneProps).toBeUndefined();
    expect(screen.queryByTestId("profile-video-supporter-notice")).toBeNull();

    mocks.isSupporter = true;
    rerender(wrapUploader(<ProfileEditAvatarUploader />, queryClient));

    const accept = dropzoneProps().accept;
    expect(accept).toHaveProperty("video/mp4");
    expect(accept).toHaveProperty("video/webm");
    expect(accept).toHaveProperty("image/png");
    expect(screen.queryByTestId("profile-video-supporter-notice")).toBeNull();
  });

  it("keeps the image-only dropzone when the supporter status read fails", () => {
    mocks.statusError = true;

    renderUploader(<ProfileEditAvatarUploader />);

    const accept = dropzoneProps().accept;
    expect(accept).toHaveProperty("image/png");
    expect(accept).toHaveProperty("image/jpeg");
    expect(accept).not.toHaveProperty("video/mp4");
    expect(screen.queryByTestId("profile-video-supporter-notice")).toBeNull();
  });
});

describe("ProfileEditBannerUploader", () => {
  it("sends the normalized crop fields at the banner aspect", async () => {
    const upload = mockUploadAccepted();
    const file = mp4File();

    renderUploader(<ProfileEditBannerUploader />);

    dropFile(file);

    fireEvent.loadedMetadata(screen.getByTestId("profile-video-probe"));

    expect(cropperProps()?.video).toBe("blob:preview");
    expect(cropperProps()?.aspect).toBe(1280 / 548);
    expect(cropperProps()?.minZoom).toBe(1);

    act(() => {
      cropperProps()?.onCropComplete({ x: 0, y: 0, width: 100, height: 50 });
    });

    fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledWith({
      file,
      type: "banner",
      cropX: 0,
      cropY: 0,
      cropWidth: 1,
      cropHeight: 0.5,
    });
  });

  it("keeps accepting non-GIF image formats", () => {
    mocks.isSupporter = false;

    renderUploader(<ProfileEditBannerUploader />);

    const accept = dropzoneProps().accept;
    expect(accept).not.toHaveProperty("image/gif");
    expect(accept).not.toHaveProperty("video/mp4");

    for (const mimeType of [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
      "image/avif",
      "image/heic",
      "image/heif",
    ]) {
      expect(accept[mimeType]).toBeTruthy();
    }

    const notice = screen.getByTestId("profile-video-supporter-notice");
    expect(notice.textContent).toContain("profileVideo.supporter.title");

    dropFile(new File(["image"], "banner.webp", { type: "image/webp" }));

    expect(cropperProps()?.image).toBe("blob:preview");
    expect(cropperProps()?.video).toBeUndefined();
  });

  it("waits for the supporter status before rendering the dropzone", () => {
    mocks.isSupporter = null;

    const queryClient = testQueryClient();
    const { rerender } = render(
      wrapUploader(<ProfileEditBannerUploader />, queryClient),
    );

    expect(screen.queryByTestId("dropzone")).toBeNull();
    expect(mocks.dropzoneProps).toBeUndefined();
    expect(screen.queryByTestId("profile-video-supporter-notice")).toBeNull();

    mocks.isSupporter = true;
    rerender(wrapUploader(<ProfileEditBannerUploader />, queryClient));

    const accept = dropzoneProps().accept;
    expect(accept).toHaveProperty("video/mp4");
    expect(accept).toHaveProperty("video/webm");
    expect(accept).toHaveProperty("image/webp");
  });

  it("keeps the image-only dropzone when the supporter status read fails", () => {
    mocks.statusError = true;

    renderUploader(<ProfileEditBannerUploader />);

    const accept = dropzoneProps().accept;
    expect(accept).toHaveProperty("image/png");
    expect(accept).not.toHaveProperty("video/mp4");
    expect(screen.queryByTestId("profile-video-supporter-notice")).toBeNull();
  });

  it("skips cropping when the video cannot be previewed", async () => {
    const upload = mockUploadAccepted();
    const file = new File(["video"], "clip.mov", {
      type: "video/quicktime",
    });

    renderUploader(<ProfileEditBannerUploader />);

    dropFile(file);

    fireEvent.error(screen.getByTestId("profile-video-probe"));

    expect(screen.getByTestId("profile-video-center-crop-notice")).toBeTruthy();
    expect(cropperProps()).toBeUndefined();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledWith({
      file,
      type: "banner",
      cropX: undefined,
      cropY: undefined,
      cropWidth: undefined,
      cropHeight: undefined,
    });
  });
});
