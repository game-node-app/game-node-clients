import { useAllObtainedAchievements } from "#@/components/achievement/hooks/useAllObtainedAchievements";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileFollowInfo } from "#@/components/profile/view/ProfileFollowInfo.tsx";
import { ProfileViewNavbarLink } from "#@/components/profile/view/ProfileViewNavbarLink";
import { useReviewsForUserId } from "#@/components/review/hooks/useReviewsForUserId";
import { GroupProps, SimpleGrid } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import criteria = FollowInfoRequestDto.criteria;

interface Props extends GroupProps {
  userId: string;
}

const ProfileViewNavbar = ({ userId, ..._groupProps }: Props) => {
  const { t } = useTranslation();
  const profileQuery = useUserProfile(userId);
  const libraryQuery = useUserLibrary(profileQuery.data?.userId);
  const collectionEntriesQuery = useCollectionEntriesForUserId({
    userId,
    limit: 1,
  });
  const reviewsQuery = useReviewsForUserId(userId, 0, 1);
  const obtainedAchievementsQuery = useAllObtainedAchievements(userId);

  return (
    <SimpleGrid
      cols={{
        base: 3,
        lg: 8,
      }}
      className={"lg:gap-16"}
    >
      <ProfileViewNavbarLink
        title={t("profile.tabs.games")}
        itemCount={collectionEntriesQuery.data?.pagination.totalItems}
        href={`/library/${userId}`}
      />
      <ProfileViewNavbarLink
        title={t("profile.tabs.reviews")}
        itemCount={reviewsQuery.data?.pagination.totalItems}
        href={`/profile/${userId}/reviews`}
      />
      <ProfileViewNavbarLink
        title={t("profile.tabs.collections")}
        itemCount={libraryQuery.data?.collections.length}
        href={`/library/${userId}`}
      />
      <ProfileViewNavbarLink
        title={t("profile.tabs.achievements")}
        href={`/achievements/${userId}`}
        itemCount={obtainedAchievementsQuery.data?.length}
      />
      <ProfileFollowInfo targetUserId={userId} criteria={criteria.FOLLOWERS} />
      <ProfileFollowInfo targetUserId={userId} criteria={criteria.FOLLOWING} />
    </SimpleGrid>
  );
};

export { ProfileViewNavbar };
