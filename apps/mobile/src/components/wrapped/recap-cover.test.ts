import { expect, it } from "vitest";
import { ImageSize } from "../../../../../packages/ui/src/components/game/util/getSizedImageUrl";
import { getRecapCoverSize } from "../../../../../packages/ui/src/components/wrapped/card/RecapCover";

it("keeps the 2x cover for boxes it can fill", () => {
  expect(getRecapCoverSize(405, 540)).toBe(ImageSize.COVER_BIG_2X);
  expect(getRecapCoverSize(400, 540)).toBe(ImageSize.COVER_BIG_2X);
});

it("steps up to 1080p when the box needs more than 528 px of cover", () => {
  // The summary card's cover: 788 tall, so a 3:4 cover needs 591 px wide.
  expect(getRecapCoverSize(591, 788)).toBe(ImageSize.FULL_HD);
});
