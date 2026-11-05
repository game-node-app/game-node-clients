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
    [1002, "0100F2C0115B6000", undefined],
  ])("category %s -> %s", (category, sourceUid, expected) => {
    expect(getExternalLookupUrl({ category, sourceUid })).toBe(expected);
  });

  it("labels category 5 as GOG", () =>
    expect(getExternalSourceName(5)).toBe("GOG"));

  it("labels category 1001 as Epic Games Namespace", () => {
    expect(getExternalSourceName(1001)).toBe("Epic Games Namespace");
  });

  it("labels category 1002 as Nintendo Title ID and keeps other labels", () => {
    expect(getExternalSourceName(1002)).toBe("Nintendo Title ID");
    expect(getExternalSourceName(1)).toBe("Steam");
    expect(getExternalSourceName(26)).toBe("Epic Games Store");
  });
});
