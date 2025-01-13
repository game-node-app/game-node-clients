import React, { useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { DEFAULT_REVIEW_EDITOR_EXTENSIONS } from "@/components/game/info/review/editor/GameInfoReviewEditor";
import {
    Box,
    Flex,
    Group,
    Spoiler,
    Stack,
    Text,
    Transition,
} from "@mantine/core";
import {
    FindAllCommentsDto,
    FindOneStatisticsDto,
    Review,
} from "@/wrapper/server";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import useUserId from "@/components/auth/hooks/useUserId";
import ReviewListItemDropdownButton from "@/components/review/view/ReviewListItemDropdownButton";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import { useGame } from "@/components/game/hooks/useGame";
import TextLink from "@/components/general/TextLink";
import GameRating from "@/components/general/input/GameRating";
import ReviewListItemComments from "@/components/review/view/ReviewListItemComments";
import ItemLikesButton from "@/components/statistics/input/ItemLikesButton";
import ItemCommentsButton from "@/components/comment/input/ItemCommentsButton";
import ItemDropdown from "@/components/general/input/dropdown/ItemDropdown";
import { useDisclosure } from "@mantine/hooks";

interface IReviewListViewProps {
    review: Review;
    withGameInfo?: boolean;
    onEditStart?: () => void;
}

const ReviewListItem = ({
    review,
    onEditStart,
    withGameInfo,
}: IReviewListViewProps) => {
    const onMobile = useOnMobile();
    const [isReadMore, setIsReadMore] = useState<boolean>(false);

    const nonEditableEditor = useEditor(
        {
            extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
            content: review?.content,
            editable: false,
        },
        [review],
    );

    const userId = useUserId();
    const profileUserId = review.profileUserId;
    const gameIdToUse = withGameInfo ? review.gameId : undefined;

    const isScoreOnlyReview = review.content == null;
    const isOwnReview = userId != undefined && userId === profileUserId;

    // Will only be enabled if gameId is not undefined.
    const gameQuery = useGame(gameIdToUse, {});

    return (
        <Stack w={"100%"} align={"center"}>
            <Group
                w={"100%"}
                justify={"space-evenly"}
                wrap={onMobile ? "wrap" : "nowrap"}
                align={"start"}
            >
                <Flex
                    direction={{
                        base: "row",
                        lg: isScoreOnlyReview ? "row" : "column",
                    }}
                    w={{
                        base: "100%",
                        lg: isScoreOnlyReview ? "25%" : "10%",
                    }}
                    justify={{
                        base: "space-between",
                        lg: isScoreOnlyReview ? "space-between" : "center",
                    }}
                    align={{
                        base: "center",
                        lg: "center",
                    }}
                >
                    <UserAvatarGroup
                        avatarProps={{
                            size: onMobile ? "lg" : "xl",
                        }}
                        userId={profileUserId}
                        groupProps={{
                            justify: onMobile ? "start" : "center",
                        }}
                        withHorizontalBreak={!onMobile}
                    />

                    <GameRating
                        value={review.rating}
                        className={
                            isScoreOnlyReview
                                ? "mt-0 lg:ms-8 lg:mb-4"
                                : "mt-0 lg:mt-4"
                        }
                        size={isScoreOnlyReview ? "lg" : "md"}
                    />
                </Flex>
                <Stack
                    className={`w-full lg:justify-end ${isScoreOnlyReview ? "lg:mt-auto" : ""}`}
                >
                    {isScoreOnlyReview ? null : (
                        <Spoiler
                            hideLabel={"Show less"}
                            showLabel={"Show more"}
                            expanded={isReadMore}
                            onExpandedChange={setIsReadMore}
                            maxHeight={300}
                        >
                            <EditorContent
                                editor={nonEditableEditor}
                                className={"w-full"}
                            />
                        </Spoiler>
                    )}

                    <Group justify={withGameInfo ? "space-between" : "end"}>
                        {withGameInfo && gameQuery.data != undefined && (
                            <Box className={"w-6/12 lg:w-4/12"}>
                                <TextLink
                                    href={`/game/${gameQuery.data?.id}`}
                                    c={"dimmed"}
                                >
                                    {gameQuery.data?.name}
                                </TextLink>
                            </Box>
                        )}
                        <Group>
                            <ReviewListItemComments review={review} />
                            <ItemLikesButton
                                targetUserId={review.profileUserId}
                                sourceId={review.id}
                                sourceType={
                                    FindOneStatisticsDto.sourceType.REVIEW
                                }
                            />

                            <ReviewListItemDropdownButton
                                review={review}
                                onEditStart={onEditStart}
                            />
                        </Group>
                    </Group>
                </Stack>
            </Group>
        </Stack>
    );
};

export default ReviewListItem;
