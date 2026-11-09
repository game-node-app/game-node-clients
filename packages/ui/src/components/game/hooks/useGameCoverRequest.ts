import { authClient } from "#@/components/auth/authClient";
import {
  GameCoverArg,
  GameCoverMode,
  GameCoverRequest,
  normalizeGameCoverMode,
  resolveGameCoverRequest,
} from "#@/components/game/util/gameCoverRequest";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { usePersonalizeGameCovers } from "#@/context";

/**
 * Resolves which cover opt-in fields a game read should send and the key
 * element that keeps its data isolated (design Decision 1).
 *
 * `useGame`/`useGames` call it with their `relations.cover` flag and their
 * optional cover argument; it is the only place that decides the opt-in.
 */
export function useGameCoverRequest(
  hasCoverRelation: boolean,
  cover?: GameCoverArg,
): GameCoverRequest {
  const personalizeGameCovers = usePersonalizeGameCovers();
  const { data: session, isPending } = authClient.useSession();

  // `debugUserId` previews count as anonymous: there is no session for the
  // server to read, so personalization would resolve to the default anyway.
  const viewerId = isPending ? null : (session?.user?.id ?? null);
  const enabled = personalizeGameCovers ?? true;
  const ownerLoading =
    !!cover && cover !== "off" && cover.ownerUserId === undefined;
  // Skip the profile lookup entirely when no opt-in can be sent anyway.
  const canResolveProfile =
    enabled && hasCoverRelation && cover !== "off" && !ownerLoading;
  const profile = useUserProfile(canResolveProfile ? viewerId : null);
  const mode: GameCoverMode | undefined = profile.data
    ? normalizeGameCoverMode(profile.data.customCoverMode)
    : undefined;

  return resolveGameCoverRequest({
    hasCoverRelation,
    cover,
    enabled,
    sessionPending: isPending,
    viewerId,
    mode,
  });
}
