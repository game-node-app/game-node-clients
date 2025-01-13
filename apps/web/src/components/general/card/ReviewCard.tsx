import React from "react";
import {
    Box,
    Button,
    Group,
    Overlay,
    Paper,
    Skeleton,
    Text,
} from "@mantine/core";
import classes from "./ReviewCard.module.css";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useReview } from "@/components/review/hooks/useReview";
import { useGame } from "@/components/game/hooks/useGame";
import {
    getSizedImageUrl,
    ImageSize,
} from "@/components/game/util/getSizedImageUrl";
import Link from "next/link";
import GameRating from "@/components/general/input/GameRating";

interface IProps {
    reviewId: string;
}

/**
 * Inspired by:
 * https://ui.mantine.dev/component/cards-carousel/
 *
 * @param review
 * @param backgroundUrl
 * @constructor
 */
const ReviewCard = ({ reviewId }: IProps) => {
    const onMobile = useOnMobile();
    const reviewQuery = useReview(reviewId);
    const gameId = reviewQuery.data?.gameId;
    const gameQuery = useGame(gameId, {
        relations: {
            cover: true,
        },
    });

    if (reviewQuery.isLoading || gameQuery.isLoading) {
        return <Skeleton h={"100%"} />;
    } else if (reviewQuery.data == undefined || gameQuery.data == undefined) {
        return null;
    }

    const profileUserId = reviewQuery.data?.profileUserId;

    // Removes HTML tags from text
    const strippedContent = reviewQuery.data.content?.replace(
        /(<([^>]+)>)/gi,
        "",
    );

    const backgroundUrl = getSizedImageUrl(
        gameQuery.data.cover?.url,
        ImageSize.COVER_BIG,
    );

    return (
        <Paper
            style={{
                backgroundImage: backgroundUrl
                    ? `url(${backgroundUrl})`
                    : "none",
            }}
            className={
                "relative w-full h-full flex flex-col justify-between items-start bg-cover bg-center p-xl rounded-md shadow-md z-0"
            }
        >
            <Overlay color="#000" backgroundOpacity={0.7} className={"z-10"} />
            <div className="z-20 relative w-full">
                <Group className={"w-full justify-between flex-nowrap"}>
                    <Box className={"max-w-64"}>
                        <UserAvatarGroup
                            avatarProps={{
                                size: "lg",
                            }}
                            userId={profileUserId}
                        />
                    </Box>

                    <GameRating value={reviewQuery.data.rating} size={"lg"} />
                </Group>

                <Text lineClamp={onMobile ? 8 : 10} className={classes.title}>
                    {strippedContent}
                </Text>
            </div>
            <Link href={`/game/${gameId}`}>
                <Button variant="white" color="dark" className={"z-10"}>
                    Visit
                </Button>
            </Link>
        </Paper>
    );
};

export default ReviewCard;
