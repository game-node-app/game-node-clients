/**
 * Cover request resolution, per design Decision 1 of `add-custom-game-covers`.
 *
 * Game reads opt in to custom covers unless the caller says otherwise:
 * - `cover` omitted: personalize for the signed-in viewer.
 * - `cover.ownerUserId`: personalize for that owner's choices (another user's
 *   content). `undefined` means the owner is still loading; `null` means the
 *   surface has no owner.
 * - `"off"`: never opt in (Daily, recap, activity feeds, admin).
 */

export type GameCoverMode = "any" | "prefer_yours" | "none";

export type GameCoverArg = { ownerUserId: string | null | undefined } | "off";

/** Fields added to a game repository read body when it is personalized. */
export type GameCoverRequestFields = {
  personalizeCovers?: true;
  coverOwnerUserId?: string;
};

/**
 * The extra last element appended to a personalized game query key. It keeps
 * personalized data isolated per viewer, opt-in form, owner and mode.
 */
export type GameCoverKeyPart = {
  viewer: string | null;
  owner: string | null;
  mode: GameCoverMode;
};

export type GameCoverRequest = {
  fields: GameCoverRequestFields;
  keyPart: GameCoverKeyPart | undefined;
};

export type GameCoverRequestContext = {
  /** Whether the read asks for `relations.cover`. */
  hasCoverRelation: boolean;
  /** The caller's cover argument; omitted means viewer personalization. */
  cover?: GameCoverArg;
  /** `personalizeGameCovers` registry value. Defaults to enabled. */
  enabled?: boolean;
  /** The session query is still loading. */
  sessionPending: boolean;
  /** Signed-in viewer id; `null` for anonymous (debug previews included). */
  viewerId: string | null;
  /** Viewer's display mode; `undefined` while the profile is loading or failed. */
  mode?: GameCoverMode;
};

const NO_COVER_REQUEST: GameCoverRequest = {
  fields: {},
  keyPart: undefined,
};

/** A missing server value reads as `any` (design Decision 10). */
export function normalizeGameCoverMode(
  mode: string | null | undefined,
): GameCoverMode {
  return mode === "prefer_yours" || mode === "none" ? mode : "any";
}

/**
 * Applies the Decision 1 table, first matching row wins. Pure so every row can
 * be unit-tested without session or profile queries.
 */
export function resolveGameCoverRequest({
  hasCoverRelation,
  cover,
  enabled = true,
  sessionPending,
  viewerId,
  mode,
}: GameCoverRequestContext): GameCoverRequest {
  // No `relations.cover`, `"off"`, or the app disables personalization.
  if (!hasCoverRelation || !enabled || cover === "off") {
    return NO_COVER_REQUEST;
  }

  // Session pending, or the owner is still loading.
  if (sessionPending) {
    return NO_COVER_REQUEST;
  }
  if (cover && cover.ownerUserId === undefined) {
    return NO_COVER_REQUEST;
  }

  const owner = cover ? cover.ownerUserId || null : null;

  // Anonymous: only another user's owner can be resolved.
  if (!viewerId) {
    if (owner === null) {
      return NO_COVER_REQUEST;
    }
    return {
      fields: { coverOwnerUserId: owner },
      keyPart: { viewer: null, owner, mode: "any" },
    };
  }

  // Signed-in but the viewer's mode is not loaded (or failed to load).
  if (mode === undefined) {
    return NO_COVER_REQUEST;
  }
  // The viewer chose to see default covers.
  if (mode === "none") {
    return NO_COVER_REQUEST;
  }

  // Own content, or a surface with no owner: the server uses the viewer.
  if (owner === null || owner === viewerId) {
    return {
      fields: { personalizeCovers: true },
      keyPart: { viewer: viewerId, owner: null, mode },
    };
  }

  // Another user's content: ask for that owner's choices.
  return {
    fields: { coverOwnerUserId: owner },
    keyPart: { viewer: viewerId, owner, mode },
  };
}
