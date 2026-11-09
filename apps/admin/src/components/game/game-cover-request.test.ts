import { resolveGameCoverRequest } from "../../../../../packages/ui/src/components/game/util/gameCoverRequest";

describe("admin game cover requests", () => {
  it("sends no opt-in fields when the app disables personalization", () => {
    expect(
      resolveGameCoverRequest({
        hasCoverRelation: true,
        enabled: false,
        sessionPending: false,
        viewerId: "viewer",
        mode: "any",
        cover: { ownerUserId: "owner-b" },
      }),
    ).toEqual({ fields: {}, keyPart: undefined });
  });

  it("would personalize for the same input with the flag on", () => {
    expect(
      resolveGameCoverRequest({
        hasCoverRelation: true,
        enabled: true,
        sessionPending: false,
        viewerId: "viewer",
        mode: "any",
      }),
    ).toEqual({
      fields: { personalizeCovers: true },
      keyPart: { viewer: "viewer", owner: null, mode: "any" },
    });
  });
});
