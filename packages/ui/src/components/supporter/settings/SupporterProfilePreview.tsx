import dayjs from "dayjs";
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { IconCrown, IconHeart } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { useInfiniteFollowInfo } from "#@/components/follow/hooks/useInfiniteFollowInfo";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { useGames } from "#@/components/game/hooks/useGames";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { SettingsDivider } from "#@/components/settings/common/SettingsCard";
import { cn } from "#@/util";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";

const FAVORITES_LIMIT = 4;

export interface SupporterProfilePreviewProps {
  /** Server-provided start of the subscription; `null` hides the since line. */
  supporterSince: string | null;
  className?: string;
}

function PreviewFollowStats({ userId }: { userId: string }) {
  const { t } = useTranslation();
  // Same DTOs as `ProfileFollowInfo`, so the profile page cache is shared.
  const followersQuery = useInfiniteFollowInfo({
    criteria: FollowInfoRequestDto.criteria.FOLLOWERS,
    targetUserId: userId,
  });
  const followingQuery = useInfiniteFollowInfo({
    criteria: FollowInfoRequestDto.criteria.FOLLOWING,
    targetUserId: userId,
  });

  const followers = followersQuery.data?.pages[0]?.pagination.totalItems;
  const following = followingQuery.data?.pages[0]?.pagination.totalItems;

  if (followers == undefined || following == undefined) return null;

  return (
    <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
      {t("supporter.features.preview.followers", { count: followers })}
      {" · "}
      {t("supporter.features.preview.following", { count: following })}
    </Text>
  );
}

function PreviewFavoriteGames({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const favoritesQuery = useFavoriteCollectionEntriesForUserId(
    userId,
    0,
    FAVORITES_LIMIT,
  );
  const gameIds = favoritesQuery.data?.data.map((entry) => entry.gameId);
  const gamesQuery = useGames({
    gameIds: gameIds ?? [],
    relations: { cover: true },
  });

  // Keep the favorites order; the games endpoint does not guarantee it.
  const games = (gameIds ?? []).flatMap((gameId) => {
    const game = gamesQuery.data?.find((item) => item.id === gameId);
    return game ? [game] : [];
  });

  if (games.length === 0) return null;

  return (
    <Stack gap={14}>
      <Text fz={11} fw={500} lh={"normal"} className={"text-[#7a7a7a]"}>
        {t("supporter.features.preview.favorites")}
      </Text>
      {/* Covers are decorative here: not links, not focusable. */}
      <Box inert className={"grid grid-cols-4 gap-1.5"}>
        {games.map((game) => (
          <GameFigureImage
            key={game.id}
            game={game}
            imageSize={ImageSize.COVER_SMALL_2X}
          />
        ))}
      </Box>
    </Stack>
  );
}

/**
 * Mock of the signed-in user's profile card as it would look with supporter
 * styling, built from their real banner, avatar, username, follow counts and
 * favorites. It is a preview: the body is `aria-hidden` and inert, and the
 * since line only ever comes from the server's `supporterSince`.
 */
export function SupporterProfilePreview({
  supporterSince,
  className,
}: SupporterProfilePreviewProps) {
  const { t } = useTranslation();
  const userId = useUserId();
  const profileQuery = useUserProfile(userId);
  const profile = profileQuery.data;
  // A failed (e.g. 404) or disabled profile query must not leave a skeleton on
  // screen forever: only an in-flight request shows one, otherwise the
  // username line is simply omitted.
  const isProfileLoading = profileQuery.isLoading;

  const banner = profile?.banner;
  const bannerVideo = profile?.bannerVideo;
  const bannerSrc = banner
    ? getS3StoredUpload(`${banner.filename}.${banner.extension}`)
    : undefined;
  const sinceYear = supporterSince ? dayjs(supporterSince).year() : null;

  return (
    <Stack gap={8} className={cn("w-full", className)}>
      <Text fz={12} fw={500} lh={"normal"} className={"text-[#7a7a7a]"}>
        {t("supporter.features.preview.caption")}
      </Text>
      <Box
        aria-hidden
        inert
        data-testid={"supporter-profile-preview"}
        className={
          "w-full overflow-hidden rounded-xl border border-solid border-[rgba(151,71,255,0.5)] bg-[#141414] opacity-90"
        }
      >
        <Box
          className={cn(
            "relative h-[76px] w-full bg-cover bg-center",
            !bannerSrc &&
              "bg-gradient-to-br from-[rgba(151,71,255,0.35)] to-[#141414]",
          )}
          style={
            bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : undefined
          }
        >
          {bannerVideo && (
            <ProfileVideo
              video={bannerVideo}
              poster={bannerSrc}
              className={"absolute inset-0"}
            />
          )}
        </Box>
        <Box className={"h-1.5 w-full bg-[#9747ff]"} />
        <Stack gap={14} className={"px-4 pb-4 pt-3.5"}>
          <Group gap={12} wrap={"nowrap"}>
            <Box
              className={
                "shrink-0 rounded-full border-2 border-solid border-[#9747ff] p-0.5"
              }
            >
              <UserAvatar userId={userId} size={48} />
            </Box>
            <Stack gap={3} className={"min-w-0 flex-1"}>
              <Group gap={6} wrap={"nowrap"}>
                {profile ? (
                  <Text
                    fz={16}
                    fw={600}
                    c={"white"}
                    lh={"normal"}
                    truncate
                    className={"min-w-0"}
                  >
                    {profile.username}
                  </Text>
                ) : (
                  isProfileLoading && (
                    <Skeleton
                      h={16}
                      w={80}
                      radius={4}
                      data-testid={"supporter-preview-username-loading"}
                    />
                  )
                )}
                <Group
                  gap={3}
                  wrap={"nowrap"}
                  className={
                    "shrink-0 rounded border border-solid border-[rgba(151,71,255,0.45)] bg-[rgba(151,71,255,0.16)] py-0.5 pl-[5px] pr-1.5 text-[#b98aff]"
                  }
                >
                  <IconCrown size={13} aria-hidden />
                  <Text
                    component={"span"}
                    fz={11}
                    fw={500}
                    lh={"normal"}
                    c={"inherit"}
                  >
                    {t("supporter.features.preview.badge")}
                  </Text>
                </Group>
              </Group>
              {sinceYear !== null && (
                <Text
                  fz={12}
                  fw={500}
                  lh={"normal"}
                  className={"text-[#b98aff]"}
                >
                  {t("supporter.features.preview.since", { year: sinceYear })}
                </Text>
              )}
              {userId && <PreviewFollowStats userId={userId} />}
            </Stack>
          </Group>
          {userId && <PreviewFavoriteGames userId={userId} />}
          <SettingsDivider />
          <Group gap={6} wrap={"nowrap"} className={"text-[#7a7a7a]"}>
            <IconHeart size={14} aria-hidden />
            <Text fz={12} lh={"normal"} c={"inherit"}>
              {t("supporter.features.preview.notListed")}
            </Text>
          </Group>
        </Stack>
      </Box>
    </Stack>
  );
}
