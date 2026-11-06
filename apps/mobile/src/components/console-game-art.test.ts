import { describe, expect, it } from "vitest";
import {
  getGameArtUrl,
  getGameScreenshotUrl,
} from "../../../../packages/ui/src/components/theme/console/gameArt";
import { ImageSize } from "../../../../packages/ui/src/components/game/util/getSizedImageUrl";

const img = (id: string, width?: number) => ({
  url: `//images.igdb.com/igdb/image/upload/t_thumb/${id}.jpg`,
  width,
});
const art = (game: object) =>
  getGameArtUrl(game as never, ImageSize.FULL_HD)?.match(/\/(\w+)\.jpg$/)?.[1];

describe("console game art", () => {
  it("takes the first sharp artwork", () => {
    expect(art({ artworks: [img("small", 600), img("sharp", 1920)] })).toBe(
      "sharp",
    );
  });

  it("falls back to a wider screenshot when every artwork is small", () => {
    expect(
      art({ artworks: [img("small", 600)], screenshots: [img("shot", 1280)] }),
    ).toBe("shot");
  });

  it("keeps artworks first when widths are unknown", () => {
    expect(art({ artworks: [img("a")], screenshots: [img("s")] })).toBe("a");
  });

  it("returns undefined without images", () => {
    expect(art({})).toBeUndefined();
  });

  it("cards take the widest screenshot, artworks only as fallback", () => {
    const shot = (game: object) =>
      getGameScreenshotUrl(game as never, ImageSize.SCREENSHOT_HUGE)?.match(
        /\/(\w+)\.jpg$/,
      )?.[1];
    expect(
      shot({
        artworks: [img("art", 1920)],
        screenshots: [img("small", 640), img("big", 1920)],
      }),
    ).toBe("big");
    expect(shot({ artworks: [img("art", 1920)] })).toBe("art");
  });
});
