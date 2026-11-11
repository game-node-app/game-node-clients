import dayjs from "dayjs";
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { IconBrandSteam, IconHeart } from "@tabler/icons-react";
import { type ReactNode } from "react";
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
import presenceClasses from "../perks/SupporterPresenceChip.module.css";
import { SupporterAvatarFrame } from "../perks/SupporterAvatarFrame";
import { SupporterBadge } from "../perks/SupporterBadge";
import { SupporterTitle } from "../perks/SupporterTitle";
import type { ActiveSupporterPerks } from "../perks/supporterPerks";

const FAVORITES_LIMIT = 4;

export interface SupporterProfilePreviewProps {
  /** Renderable perks; the preview follows the same values as the header. */
  perks: ActiveSupporterPerks | null;
  /** Caption above the card ("Live preview" or the example variant). */
  caption: ReactNode;
  /** Wall membership line; `null` hides it. */
  onWall: boolean | null;
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
 * Static sample of the "Playing now" chip. The preview never calls the presence
 * endpoint; it only shows the copy invented for the mock (design D7).
 */
function PreviewPresence({ perks }: { perks: ActiveSupporterPerks }) {
  const { t } = useTranslation();
  const colors = perks.theme
    ? {
        backgroundColor: perks.accentSoft,
        borderColor: perks.accentBorder,
      }
    : {
        backgroundColor: "#1f1f1f",
        borderColor: "#2a2a2a",
      };

  return (
    <Group
      gap={6}
      wrap={"nowrap"}
      align={"center"}
      data-testid={"supporter-preview-presence"}
      className={
        "h-7 w-fit max-w-full rounded-full border border-solid px-2.5"
      }
      style={colors}
    >
      <Box component={"span"} className={presenceClasses.dot} aria-hidden />
      <IconBrandSteam size={14} color={"#adadad"} aria-hidden />
      <Text component={"span"} fz={12} fw={500} lh={"normal"} c={"#adadad"}>
        {t("supporter.perks.preview.samplePresence")}
      </Text>
    </Group>
  );
}

/**
 * Mock of the signed-in user's profile card as it would look with supporter
 * styling, built from their real banner, avatar, username, follow counts and
 * favorites, plus the same perk components used by the header. It is a preview:
 * the body is `aria-hidden` and inert, and the since line only ever comes from
 * the server's `supporterSince`.
 */
export function SupporterProfilePreview({
  perks,
  caption,
  onWall,
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
        {caption}
      </Text>
      <Box
        aria-hidden
        inert
        data-testid={"supporter-profile-preview"}
        className={
          "w-full overflow-hidden rounded-xl border border-solid bg-[#141414] opacity-90"
        }
        style={{ borderColor: perks?.accentBorder ?? "#2a2a2a" }}
      >
        <Box
          className={"relative h-[76px] w-full bg-cover bg-center"}
          style={
            bannerSrc
              ? { backgroundImage: `url(${bannerSrc})` }
              : {
                  background: `linear-gradient(135deg, ${
                    perks?.accentSoft ?? "#1f1f1f"
                  }, #141414)`,
                }
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
        {perks?.theme && (
          <Box
            data-testid={"supporter-preview-theme-strip"}
            className={
              "flex h-[21px] w-full shrink-0 items-center justify-end pe-6"
            }
            style={{ backgroundColor: perks.accent }}
          >
            <Text
              fz={10}
              fs={"italic"}
              fw={500}
              lh={"normal"}
              style={{ color: perks.onAccent }}
            >
              {t("supporter.badge.label")}
            </Text>
          </Box>
        )}
        <Stack gap={14} className={"px-4 pb-4 pt-3.5"}>
          <Group gap={12} wrap={"nowrap"}>
            {perks?.border ? (
              <SupporterAvatarFrame accent={perks.accent} className={"shrink-0"}>
                <UserAvatar userId={userId} size={48} />
              </SupporterAvatarFrame>
            ) : (
              <Box className={"shrink-0"}>
                <UserAvatar userId={userId} size={48} />
              </Box>
            )}
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
                {perks?.badge && (
                  <SupporterBadge variant={"full"} perks={perks} />
                )}
              </Group>
              {perks?.titleKey && (
                <SupporterTitle titleKey={perks.titleKey} perks={perks} />
              )}
              {perks?.liveProfile && <PreviewPresence perks={perks} />}
              {sinceYear !== null && (
                <Text
                  fz={12}
                  fw={500}
                  lh={"normal"}
                  style={{
                    color: perks?.theme ? perks.accentText : "#adadad",
                  }}
                >
                  {t("supporter.features.preview.since", { year: sinceYear })}
                </Text>
              )}
              {userId && <PreviewFollowStats userId={userId} />}
            </Stack>
          </Group>
          {userId && <PreviewFavoriteGames userId={userId} />}
          <SettingsDivider />
        </Stack>
      </Box>
      {onWall !== null && (
        <Group gap={6} wrap={"nowrap"} className={"text-[#7a7a7a]"}>
          <IconHeart size={14} aria-hidden />
          <Text fz={12} lh={"normal"} c={"inherit"}>
            {t(
              onWall
                ? "supporter.perks.preview.onWall"
                : "supporter.perks.preview.notOnWall",
            )}
          </Text>
        </Group>
      )}
    </Stack>
  );
}
