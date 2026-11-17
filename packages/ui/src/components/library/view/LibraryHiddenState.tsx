import { useUserId } from "#@/components/auth/hooks/useUserId";
import { UserFollowActions } from "#@/components/follow/input/UserFollowActions";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { cn } from "#@/util";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { ProfileResponseDto } from "@repo/wrapper/server";

/**
 * The profile fields that decide whether its library can be seen.
 *
 * Kept structural so callers can pass a full `ProfileResponseDto` or a slice of
 * it (a cached profile, a test fixture).
 */
export type LibraryVisibilityProfile = Pick<
  ProfileResponseDto,
  "userId" | "canViewLibrary" | "libraryVisibility"
>;

/**
 * Whether `profile` hides its library from `viewerId`.
 *
 * The owner always sees their own library, even if a stale response says
 * otherwise. A profile without `canViewLibrary` (an old cached entry) counts as
 * visible; the server is the source of truth and answers 404 for hidden reads.
 */
export function isLibraryHiddenForViewer(
  profile: LibraryVisibilityProfile | null | undefined,
  viewerId: string | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }

  if (viewerId && viewerId === profile.userId) {
    return false;
  }

  return profile.canViewLibrary === false;
}

export interface LibraryHiddenStateProps {
  /**
   * The viewed profile, when the caller already has it. Omit to let the
   * component read it from the cache/server with `userId`.
   */
  profile?: LibraryVisibilityProfile | null;
  /** Owner of the hidden content, used when `profile` is not provided. */
  userId?: string;
  className?: string;
}

/**
 * Shared "you cannot see this" notice for another user's library-derived
 * content.
 *
 * - A hidden library says why (`private` or `followers`, with the follow action
 *   for the followers-only case).
 * - When only `userId` is given (a read answered 404), it falls back to the
 *   generic "This content is not visible" copy if the library itself is visible,
 *   because the server deliberately does not distinguish hidden from missing.
 *
 * An explicit `profile` that does not hide its library renders nothing, so
 * callers can pass the profile they already loaded without double-checking.
 */
export function LibraryHiddenState({
  profile,
  userId,
  className,
}: LibraryHiddenStateProps) {
  const { t } = useTranslation();
  const viewerId = useUserId();
  const profileQuery = useUserProfile(
    profile == undefined ? userId : undefined,
    {
      enabled: profile == undefined && !!userId,
    },
  );
  const resolvedProfile = profile ?? profileQuery.data;
  const isHidden = isLibraryHiddenForViewer(resolvedProfile, viewerId);

  if (profile != undefined && !isHidden) {
    return null;
  }

  const isFollowersOnly =
    isHidden && resolvedProfile?.libraryVisibility === "followers";

  const title = isHidden
    ? isFollowersOnly
      ? t("libraryVisibility.empty.followersTitle")
      : t("libraryVisibility.empty.privateTitle")
    : t("libraryVisibility.hidden.title");

  const description = isHidden
    ? isFollowersOnly
      ? t("libraryVisibility.empty.followersDescription")
      : t("libraryVisibility.empty.privateDescription")
    : t("libraryVisibility.hidden.description");

  const canFollow =
    isFollowersOnly &&
    resolvedProfile != undefined &&
    viewerId != undefined &&
    viewerId !== resolvedProfile.userId;

  return (
    <Paper
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={cn("w-full bg-paper-0", className)}
      data-testid={"library-hidden-state"}
      data-visibility={
        isHidden ? resolvedProfile?.libraryVisibility : "hidden-content"
      }
    >
      <Stack gap={"sm"} align={"flex-start"}>
        <Title order={2} size={"h3"}>
          {title}
        </Title>
        <Text size={"sm"} c={"dimmed"}>
          {description}
        </Text>
        {canFollow && (
          <UserFollowActions targetUserId={resolvedProfile.userId} />
        )}
      </Stack>
    </Paper>
  );
}
