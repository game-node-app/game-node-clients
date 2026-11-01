import { getExternalLookupUrl } from "./getExternalLookupUrl";
import { getExternalSourceName } from "./getExternalSourceName";

describe("getExternalLookupUrl", () => {
  it.each([
    [1, "730", "https://steamdb.info/app/730"],
    [
      1001,
      "9773aa1aa54f4f7b80e44bef04986cea",
      "https://egdata.app/sandboxes/9773aa1aa54f4f7b80e44bef04986cea",
    ],
    [5, "123", undefined],
  ])("category %s -> %s", (category, sourceUid, expected) => {
    expect(getExternalLookupUrl({ category, sourceUid })).toBe(expected);
  });

  it("labels category 1001 as Epic Games Namespace", () => {
    expect(getExternalSourceName(1001)).toBe("Epic Games Namespace");
  });
});
