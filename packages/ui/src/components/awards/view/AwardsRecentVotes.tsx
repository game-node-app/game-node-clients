import React from "react";
import { useAwardsRecentVotes } from "#@/components/awards/hooks/useAwardsRecentVotes";
import { Group, Stack, Text } from "@mantine/core";
import { DetailsBox, UserAvatarGroup } from "#@/components";
import { Link } from "#@/util";

interface Props {
  eventId: number;
  limit?: number;
}

const AwardsRecentVotes = ({ eventId, limit = 10 }: Props) => {
  const recentVotesQuery = useAwardsRecentVotes(eventId);
  const renderedItems = recentVotesQuery.data?.slice(0, limit);

  if (!renderedItems) {
    return null;
  }

  return (
    <DetailsBox title={"Recent votes"} withDimmedTitle>
      {renderedItems.map((vote) => {
        const category = vote.category;
        return (
          <Link
            key={vote.id}
            href={`/awards/${category?.event?.year}/nominees/${vote.profileUserId}`}
            className={
              "flex flex-nowrap gap-2 p-3 bg-paper-2 items-center rounded-md"
            }
          >
            <UserAvatarGroup
              userId={vote.profileUserId}
              groupProps={{
                gap: "xs",
              }}
              avatarProps={{
                size: "sm",
              }}
              textProps={{
                className: "text-sm w-fit line-clamp-1",
              }}
            />
            <Text span className={"text-sm"}>
              voted in
            </Text>
            <Text span className={"font-bold text-sm"}>
              {category.name}
            </Text>
          </Link>
        );
      })}
    </DetailsBox>
  );
};

export { AwardsRecentVotes };
