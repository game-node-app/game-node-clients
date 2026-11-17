import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  isLibraryHiddenForViewer,
  type LibraryVisibilityProfile,
} from "#@/components/library/view/LibraryHiddenState";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";

export interface UseIsLibraryHiddenResult {
  /** True only when the viewed profile exists and hides its library from the viewer. */
  isHidden: boolean;
  /** True when the viewer owns the viewed library (it is never hidden for them). */
  isOwner: boolean;
  /** The viewed profile, once one is cached or loaded. */
  profile: LibraryVisibilityProfile | undefined;
}

/**
 * Whether `userId`'s library is hidden from the current viewer.
 *
 * Pass an already loaded `profile` to skip the extra read; it resolves through
 * the same `useUserProfile` cache key, so callers that render a profile page
 * never add a request.
 */
export function useIsLibraryHidden(
  userId: string | undefined | null,
  profile?: LibraryVisibilityProfile | null,
): UseIsLibraryHiddenResult {
  const viewerId = useUserId();
  const profileQuery = useUserProfile(
    profile == undefined ? userId : undefined,
    {
      enabled: profile == undefined && !!userId,
    },
  );
  const resolvedProfile = profile ?? profileQuery.data;

  return {
    isHidden: isLibraryHiddenForViewer(resolvedProfile, viewerId),
    isOwner: !!viewerId && viewerId === (resolvedProfile?.userId ?? userId),
    profile: resolvedProfile,
  };
}
