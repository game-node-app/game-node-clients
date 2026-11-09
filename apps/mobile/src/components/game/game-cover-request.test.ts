import { describe, expect, it } from "vitest";
import {
  GameCoverRequestContext,
  normalizeGameCoverMode,
  resolveGameCoverRequest,
} from "../../../../../packages/ui/src/components/game/util/gameCoverRequest";
import { isPersonalizedGameQuery } from "../../../../../packages/ui/src/components/game/util/isPersonalizedGameQuery";

const signedIn: GameCoverRequestContext = {
  hasCoverRelation: true,
  sessionPending: false,
  viewerId: "viewer",
  mode: "any",
};

describe("resolveGameCoverRequest (design Decision 1 table)", () => {
  it("sends nothing when the cover relation is not requested", () => {
    expect(
      resolveGameCoverRequest({ ...signedIn, hasCoverRelation: false }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing when the caller opts out with 'off'", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        cover: "off",
        sessionPending: true,
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing when the app disables personalization (admin)", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        enabled: false,
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing while the session is pending", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        sessionPending: true,
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing while the owner is still loading", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        cover: { ownerUserId: undefined },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing for an anonymous viewer with no owner", () => {
    expect(
      resolveGameCoverRequest({
        hasCoverRelation: true,
        sessionPending: false,
        viewerId: null,
      }),
    ).toEqual({ fields: {}, keyPart: undefined });

    expect(
      resolveGameCoverRequest({
        hasCoverRelation: true,
        sessionPending: false,
        viewerId: null,
        cover: { ownerUserId: null },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("asks for the owner's choices for an anonymous viewer with an owner", () => {
    expect(
      resolveGameCoverRequest({
        hasCoverRelation: true,
        sessionPending: false,
        viewerId: null,
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({
      fields: { coverOwnerUserId: "owner-b" },
      keyPart: { viewer: null, owner: "owner-b", mode: "any" },
    });
  });

  it("sends nothing for a signed-in viewer whose profile is not loaded or failed", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        mode: undefined,
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("sends nothing when the viewer's mode is none", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        mode: "none",
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("personalizes for the viewer when the surface has no owner", () => {
    expect(resolveGameCoverRequest(signedIn)).toEqual({
      fields: { personalizeCovers: true },
      keyPart: { viewer: "viewer", owner: null, mode: "any" },
    });

    expect(
      resolveGameCoverRequest({ ...signedIn, cover: { ownerUserId: null } }),
    ).toEqual({
      fields: { personalizeCovers: true },
      keyPart: { viewer: "viewer", owner: null, mode: "any" },
    });
  });

  it("normalizes an owner equal to the viewer to viewer personalization", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        cover: { ownerUserId: "viewer" },
      }),
    ).toEqual({
      fields: { personalizeCovers: true },
      keyPart: { viewer: "viewer", owner: null, mode: "any" },
    });
  });

  it("keeps the mode in the key for another user's content", () => {
    expect(
      resolveGameCoverRequest({
        ...signedIn,
        mode: "prefer_yours",
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({
      fields: { coverOwnerUserId: "owner-b" },
      keyPart: { viewer: "viewer", owner: "owner-b", mode: "prefer_yours" },
    });
  });

  it("isolates keys by viewer, owner and mode", () => {
    const base = resolveGameCoverRequest({
      ...signedIn,
      cover: { ownerUserId: "owner-b" },
    }).keyPart;
    const otherViewer = resolveGameCoverRequest({
      ...signedIn,
      viewerId: "viewer-2",
      cover: { ownerUserId: "owner-b" },
    }).keyPart;
    const otherOwner = resolveGameCoverRequest({
      ...signedIn,
      cover: { ownerUserId: "owner-c" },
    }).keyPart;
    const otherMode = resolveGameCoverRequest({
      ...signedIn,
      mode: "prefer_yours",
      cover: { ownerUserId: "owner-b" },
    }).keyPart;

    expect(base).toBeDefined();
    expect(base).not.toEqual(otherViewer);
    expect(base).not.toEqual(otherOwner);
    expect(base).not.toEqual(otherMode);
  });
});

describe("normalizeGameCoverMode", () => {
  it("keeps known modes", () => {
    expect(normalizeGameCoverMode("any")).toBe("any");
    expect(normalizeGameCoverMode("prefer_yours")).toBe("prefer_yours");
    expect(normalizeGameCoverMode("none")).toBe("none");
  });

  it("reads a missing value as any", () => {
    expect(normalizeGameCoverMode(undefined)).toBe("any");
    expect(normalizeGameCoverMode(null)).toBe("any");
    expect(normalizeGameCoverMode("")).toBe("any");
  });
});

describe("isPersonalizedGameQuery", () => {
  const dto = { relations: { cover: true } };

  it("is false for the unchanged unpersonalized keys", () => {
    expect(isPersonalizedGameQuery(["game", 1, dto])).toBe(false);
    expect(isPersonalizedGameQuery(["game", "all", [1, 2], dto])).toBe(false);
    expect(isPersonalizedGameQuery(["userProfile", "viewer"])).toBe(false);
    expect(isPersonalizedGameQuery(["game"])).toBe(false);
  });

  it("is true when the key carries a cover context", () => {
    expect(
      isPersonalizedGameQuery([
        "game",
        1,
        dto,
        { coverContext: { viewer: "viewer", owner: null, mode: "any" } },
      ]),
    ).toBe(true);
    expect(
      isPersonalizedGameQuery([
        "game",
        "all",
        [1, 2],
        dto,
        { coverContext: { viewer: null, owner: "owner-b", mode: "any" } },
      ]),
    ).toBe(true);
  });
});
