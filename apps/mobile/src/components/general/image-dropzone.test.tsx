// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageDropzone } from "../../../../../packages/ui/src/components/general/ImageDropzone";

const dropzoneState = vi.hoisted(() => ({
  props: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@mantine/dropzone", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/dropzone")>();

  const MockStatus = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );

  const MockDropzone = Object.assign(
    ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      dropzoneState.props = props;
      return <div data-testid={"dropzone"}>{children}</div>;
    },
    {
      Accept: MockStatus,
      Reject: MockStatus,
      Idle: MockStatus,
    },
  );

  return { ...actual, Dropzone: MockDropzone };
});

type CapturedProps = {
  accept?: Record<string, string[]> | string[];
  onReject?: (
    rejections: {
      file: File;
      errors: { code: string; message: string }[];
    }[],
  ) => void;
};

const captured = () => dropzoneState.props as CapturedProps;

const renderDropzone = (element: React.ReactElement) =>
  render(<MantineProvider>{element}</MantineProvider>);

afterEach(() => {
  cleanup();
  dropzoneState.props = undefined;
  vi.clearAllMocks();
});

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

describe("ImageDropzone", () => {
  it("renders translation keys instead of hard-coded English", () => {
    renderDropzone(
      <ImageDropzone maxFiles={1} maxSize={3 * 1024 ** 2} onDrop={vi.fn()} />,
    );

    expect(screen.getByText("upload.dragPrompt")).toBeTruthy();
    expect(screen.getByText("upload.labels.maxFiles")).toBeTruthy();
    expect(screen.getByText("upload.labels.maxSize")).toBeTruthy();
    expect(screen.queryByText(/Drag images here/)).toBeNull();
  });

  it("defaults to the image MIME list", () => {
    renderDropzone(<ImageDropzone onDrop={vi.fn()} />);

    expect(captured().accept).toEqual(
      expect.arrayContaining(["image/png", "image/gif", "image/jpeg"]),
    );
  });

  it("honors the accept map passed to it", () => {
    const accept = {
      "video/mp4": [".mp4"],
      "video/x-matroska": [".mkv"],
      "": [".mkv"],
    };

    renderDropzone(<ImageDropzone accept={accept} onDrop={vi.fn()} />);

    expect(captured().accept).toEqual(accept);
  });

  it("renders a friendly message for each rejection code", () => {
    renderDropzone(
      <ImageDropzone
        accept={{ "video/mp4": [".mp4"] }}
        maxFiles={1}
        maxSize={1024 ** 2}
        onDrop={vi.fn()}
      />,
    );

    const file = new File(["x"], "clip.mp4", { type: "video/mp4" });

    act(() => {
      captured().onReject?.([
        {
          file,
          errors: [
            { code: "file-invalid-type", message: "Invalid file type" },
            { code: "file-too-large", message: "File is larger than 1MB" },
            { code: "file-too-small", message: "File is smaller than 0MB" },
            { code: "too-many-files", message: "Too many files" },
            { code: "unknown-code", message: "Something else" },
          ],
        },
      ]);
    });

    expect(screen.getByText("upload.messages.rejectedType")).toBeTruthy();
    expect(screen.getByText("upload.messages.rejectedTooLarge")).toBeTruthy();
    expect(screen.getByText("upload.messages.rejectedTooSmall")).toBeTruthy();
    expect(
      screen.getByText("upload.messages.rejectedTooManyFiles"),
    ).toBeTruthy();
    expect(screen.getByText("upload.messages.rejectedUnknown")).toBeTruthy();
    expect(screen.queryByText(/file-invalid-type/)).toBeNull();
    expect(screen.queryByText(/Invalid file type/)).toBeNull();
  });

  it("shows a caller-provided prompt for video-only flows", () => {
    renderDropzone(
      <ImageDropzone onDrop={vi.fn()} prompt={"upload.dragPromptVideo"} />,
    );

    expect(screen.getByText("upload.dragPromptVideo")).toBeTruthy();
  });
});
