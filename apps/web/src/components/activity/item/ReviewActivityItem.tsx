import React from "react";
import { Box, Group, Overlay, Stack, Text, Title } from "@mantine/core";
import { Activity } from "@/wrapper/server";
import { useReview } from "@/components/review/hooks/useReview";
import { useGame } from "@/components/game/hooks/useGame";
import {
    getSizedImageUrl,
    ImageSize,
} from "@/components/game/util/getSizedImageUrl";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import ActivityItemLikes from "@/components/activity/input/ActivityItemLikes";
import GameRating from "@/components/general/input/GameRating";
import Link from "next/link";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import ActivityCreateDate from "@/components/activity/item/ActivityCreateDate";
import ActivityItemComments from "@/components/activity/input/ActivityItemComments";
import { ActivityItemProps } from "@/components/activity/types";

interface Props extends ActivityItemProps {}

const ReviewActivityItem = ({ activity, withUserAvatar = true }: Props) => {
    const onMobile = useOnMobile();
    const reviewQuery = useReview(activity.reviewId!);
    const gameId = reviewQuery.data?.gameId;
    const gameQuery = useGame(gameId, {
        relations: {
            cover: true,
        },
    });
    const imageUrl = getSizedImageUrl(
        gameQuery.data?.cover?.url,
        onMobile ? ImageSize.SCREENSHOT_MED : ImageSize.SCREENSHOT_BIG,
    );

    return (
        <Box
            style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }}
            className={"relative w-full mih-[160px] rounded-md"}
        >
            <Overlay backgroundOpacity={0.8} className={"z-0"}></Overlay>
            <Group
                className={
                    "w-full h-full relative z-20 items-center flex-nowrap"
                }
            >
                <Box className={withUserAvatar ? "w-3/12 lg:w-2/12" : "hidden"}>
                    <UserAvatarGroup
                        userId={activity.profileUserId}
                        groupProps={{
                            wrap: "wrap",
                            justify: "center",
                            gap: onMobile ? 3 : 5,
                        }}
                        textProps={{
                            className: "text-sm md:text-md",
                        }}
                        avatarProps={{ size: onMobile ? "lg" : "xl" }}
                        withHorizontalBreak
                    />
                </Box>
                <Box
                    className={
                        withUserAvatar
                            ? "w-3/12"
                            : "w-5/12 lg:w-4/12 ms-4 lg:ms-8"
                    }
                >
                    <Stack gap={5}>
                        <Link
                            href={`/game/${gameQuery.data?.id}?reviewId=${activity.reviewId}`}
                        >
                            <Title className={"text-sm lg:text-md"}>
                                {gameQuery.data?.name}
                            </Title>
                        </Link>
                        <Text
                            c={"dimmed"}
                            fz={{
                                base: "xs",
                                md: "sm",
                            }}
                        >
                            Reviewed
                        </Text>
                    </Stack>
                </Box>
                <Box className={"w-6/12 lg:w-3/12 ms-auto h-full"}>
                    <Stack
                        className={
                            "w-full h-full items-end justify-between py-4 pe-2 lg:pe-3"
                        }
                    >
                        <ActivityCreateDate
                            createdAtDate={activity.createdAt}
                        />

                        <Link
                            href={`/game/${gameQuery.data?.id}?reviewId=${activity.reviewId}`}
                        >
                            <GameRating
                                value={reviewQuery.data?.rating}
                                size={"md"}
                            />
                        </Link>

                        <Group>
                            <ActivityItemComments activity={activity} />
                            <ActivityItemLikes activity={activity} />
                        </Group>
                    </Stack>
                </Box>
            </Group>
        </Box>
    );
};

export default ReviewActivityItem;
