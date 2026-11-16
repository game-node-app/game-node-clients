// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportCardImage } from "../../../../../packages/ui/src/components/wrapped/util/exportCardImage";

const mocks = vi.hoisted(() => ({
  toBlob: vi.fn(),
  loadRecapFonts: vi.fn(async () => {}),
}));

vi.mock("html-to-image", () => ({
  toBlob: mocks.toBlob,
}));

vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCardFonts",
  () => ({
    loadRecapFonts: mocks.loadRecapFonts,
  }),
);

function imageBlob(type: string) {
  return new Blob(["image"], { type });
}

beforeEach(() => {
  mocks.toBlob.mockReset();
  mocks.loadRecapFonts.mockClear();
});

describe("exportCardImage", () => {
  it("exports the story at its native size as a JPEG by default", async () => {
    mocks.toBlob.mockResolvedValue(imageBlob("image/jpeg"));
    const node = document.createElement("div");

    const file = await exportCardImage(node, "story");

    expect(mocks.loadRecapFonts).toHaveBeenCalledTimes(1);
    expect(mocks.toBlob).toHaveBeenCalledWith(
      node,
      expect.objectContaining({
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        type: "image/jpeg",
        quality: 0.92,
      }),
    );
    expect(file).toBeInstanceOf(File);
    expect(file.name).toMatch(/^gamenode-recap-\d+\.jpeg$/);
    expect(file.type).toBe("image/jpeg");
  });

  it("exports a PNG at the story size for the stories", async () => {
    mocks.toBlob.mockResolvedValue(imageBlob("image/png"));
    const node = document.createElement("div");

    const file = await exportCardImage(node, "story", {
      type: "image/png",
      filenamePrefix: "gamenode-story",
    });

    const options = mocks.toBlob.mock.calls[0][1] as Record<string, unknown>;
    expect(options).toMatchObject({
      width: 1080,
      height: 1920,
      pixelRatio: 1,
      type: "image/png",
    });
    expect(options).not.toHaveProperty("quality");
    expect(file.name).toMatch(/^gamenode-story-\d+\.png$/);
    expect(file.type).toBe("image/png");
  });

  it("exports the feed at its native size", async () => {
    mocks.toBlob.mockResolvedValue(imageBlob("image/jpeg"));
    const node = document.createElement("div");

    await exportCardImage(node, "feed");

    expect(mocks.toBlob).toHaveBeenCalledWith(
      node,
      expect.objectContaining({ width: 1600, height: 900, pixelRatio: 1 }),
    );
  });

  it("fails when the renderer returns no image", async () => {
    mocks.toBlob.mockResolvedValue(null);
    const node = document.createElement("div");

    await expect(exportCardImage(node, "story")).rejects.toThrow(
      "Failed to generate final image.",
    );
  });
});
