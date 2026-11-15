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
import {
  computeCropRect,
  shouldUsePreparedVideo,
} from "../../../../../packages/ui/src/components/profile/util/prepareProfileVideo";

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
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
      invalidate: vi.fn(),
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({
    useSupporterStatus: () => ({
      data: { isSupporter: true },
      isLoading: false,
      isPending: false,
      isError: false,
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/util/prepareProfileVideo",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../packages/ui/src/components/profile/util/prepareProfileVideo")
      >();

    return { ...actual, prepareProfileVideo: mocks.prepare };
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

const MockLink = ({ children, ...props }: React.ComponentProps<"a">) =>
  React.createElement("a", props, children);

const dropFile = (file: File) => {
  const props = mocks.dropzoneProps as unknown as {
    onDrop: (files: FileWithPath[]) => void;
  };
  act(() => {
    props.onDrop([file as FileWithPath]);
  });
};

/** Walks the avatar uploader up to the confirm step with a framed crop. */
const goToConfirmStep = (file: File) => {
  render(
    <MantineProvider>
      <UIProvider presenters={{ Link: MockLink }} hooks={{} as UIHookRegistry}>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
              },
            })
          }
        >
          <ProfileEditAvatarUploader />
        </QueryClientProvider>
      </UIProvider>
    </MantineProvider>,
  );

  dropFile(file);
  fireEvent.loadedMetadata(screen.getByTestId("profile-video-probe"));

  const cropper = mocks.cropperProps as unknown as {
    onCropComplete: (percentages: Area) => void;
  };
  act(() => {
    cropper.onCropComplete({ x: 10, y: 20, width: 50, height: 25 });
  });

  fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));
};

const clickConfirm = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "actions.confirm" }));
  });
};

const mp4File = () => new File(["video"], "clip.mp4", { type: "video/mp4" });

beforeEach(() => {
  mocks.prepare.mockReset();
  mocks.dropzoneProps = undefined;
  mocks.cropperProps = undefined;

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

describe("computeCropRect", () => {
  it("converts the cropper percentages to even pixel values", () => {
    expect(
      computeCropRect(1920, 1080, "banner", {
        x: 10,
        y: 20,
        width: 50,
        height: 25,
      }),
    ).toEqual({ left: 192, top: 216, width: 960, height: 270 });
  });

  it("never leaves the frame when the crop touches the far edge", () => {
    const crop = computeCropRect(1001, 563, "avatar", {
      x: 50,
      y: 0,
      width: 60,
      height: 100,
    });

    expect(crop.left + crop.width).toBeLessThanOrEqual(1001);
    expect(crop.width % 2).toBe(0);
    expect(crop.height % 2).toBe(0);
  });

  it("centers the slot aspect when there is no crop (unpreviewable video)", () => {
    expect(computeCropRect(1920, 1080, "avatar")).toEqual({
      left: 420,
      top: 0,
      width: 1080,
      height: 1080,
    });

    const banner = computeCropRect(1080, 1920, "banner");
    expect(banner.width).toBe(1080);
    expect(banner.left).toBe(0);
    expect(banner.width / banner.height).toBeCloseTo(1280 / 548, 1);
  });
});

describe("shouldUsePreparedVideo", () => {
  it("only keeps a prepared file that is smaller than the original", () => {
    expect(shouldUsePreparedVideo(1000, 400)).toBe(true);
    expect(shouldUsePreparedVideo(1000, 1000)).toBe(false);
    expect(shouldUsePreparedVideo(1000, 0)).toBe(false);
  });
});

describe("video preparation in the avatar uploader", () => {
  it("uploads the prepared file without a crop", async () => {
    const prepared = new File(["small"], "profile-video.mp4", {
      type: "video/mp4",
    });
    mocks.prepare.mockResolvedValue(prepared);
    const upload = vi
      .spyOn(ProfileService, "profileVideoControllerUploadV1")
      .mockResolvedValue({} as UploadProfileVideoResponseDto);

    goToConfirmStep(mp4File());
    await clickConfirm();

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(mocks.prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        slot: "avatar",
        cropPercentages: { x: 10, y: 20, width: 50, height: 25 },
      }),
    );
    expect(upload).toHaveBeenCalledWith({
      file: prepared,
      type: "avatar",
      cropX: undefined,
      cropY: undefined,
      cropWidth: undefined,
      cropHeight: undefined,
    });
  });

  it("falls back to the original file and its crop when preparation fails", async () => {
    mocks.prepare.mockResolvedValue(null);
    const original = mp4File();
    const upload = vi
      .spyOn(ProfileService, "profileVideoControllerUploadV1")
      .mockResolvedValue({} as UploadProfileVideoResponseDto);

    goToConfirmStep(original);
    await clickConfirm();

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledWith({
      file: original,
      type: "avatar",
      cropX: 0.1,
      cropY: 0.2,
      cropWidth: 0.5,
      cropHeight: 0.25,
    });
  });

  it("uploads nothing when the user cancels the preparation", async () => {
    mocks.prepare.mockRejectedValue(new DOMException("Aborted", "AbortError"));
    const upload = vi
      .spyOn(ProfileService, "profileVideoControllerUploadV1")
      .mockResolvedValue({} as UploadProfileVideoResponseDto);

    goToConfirmStep(mp4File());
    await clickConfirm();

    await waitFor(() => expect(mocks.prepare).toHaveBeenCalledTimes(1));
    expect(upload).not.toHaveBeenCalled();
  });

  it("shows progress and blocks confirm while preparing", async () => {
    let finish: (file: File | null) => void = () => {};
    mocks.prepare.mockImplementation(
      () => new Promise<File | null>((resolve) => (finish = resolve)),
    );
    vi.spyOn(ProfileService, "profileVideoControllerUploadV1").mockResolvedValue(
      {} as UploadProfileVideoResponseDto,
    );

    goToConfirmStep(mp4File());
    await clickConfirm();

    expect(screen.getByTestId("profile-video-preparation")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "actions.confirm",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    await act(async () => finish(null));
    await waitFor(() =>
      expect(screen.queryByTestId("profile-video-preparation")).toBeNull(),
    );
  });
});
