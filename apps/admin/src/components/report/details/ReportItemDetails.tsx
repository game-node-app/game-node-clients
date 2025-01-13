"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useReport } from "@/components/report/hooks/useReport";
import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import {
    ActivityComment,
    CommentService,
    FindAllCommentsDto,
    Report,
    ReviewComment,
    ReviewsService,
} from "@/wrapper/server";
import ReportSourceType = Report.sourceType;
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import {
    reportCategoryToDescription,
    reportCategoryToString,
    reportSourceTypeToString,
} from "@/components/report/util/reportCategoryToString";
import { match } from "ts-pattern";
import { getMainAppHref } from "@/util/getMainAppHref";
import Link from "next/link";
import MainAppLink from "@/components/general/MainAppLink";
import CenteredLoading from "@/components/general/CenteredLoading";
import { IconExternalLink } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ReportHandleConfirmModal from "@/components/report/modal/ReportHandleConfirmModal";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

interface Props {
    reportId: number;
}

const getSourceUrl = async (report: Report) => {
    return await match<ReportSourceType, Promise<string> | string>(
        report.sourceType,
    )
        .with(ReportSourceType.REVIEW, async () => {
            const review = await ReviewsService.reviewsControllerFindOneByIdV1(
                report.targetReviewId!,
            );
            return `/game/${review.gameId}?reviewId=${review.id}`;
        })
        .with(ReportSourceType.PROFILE, () => {
            return `/profile/${report.targetProfileUserId}`;
        })
        .with(ReportSourceType.REVIEW_COMMENT, async () => {
            const commentSourceType = FindAllCommentsDto.sourceType.REVIEW;
            const reviewComment =
                await CommentService.commentControllerFindOneByIdV1(
                    commentSourceType,
                    report.targetReviewCommentId!,
                );
            const review = await ReviewsService.reviewsControllerFindOneByIdV1(
                (reviewComment as ReviewComment).reviewId,
            );
            return `/game/${review.gameId}?reviewId=${review.id}`;
        })
        .with(ReportSourceType.ACTIVITY_COMMENT, async () => {
            const commentSourceType = FindAllCommentsDto.sourceType.REVIEW;
            const activityComment =
                (await CommentService.commentControllerFindOneByIdV1(
                    commentSourceType,
                    report.targetReviewCommentId!,
                )) as ActivityComment;
            return `/activity/detail/${activityComment.activityId}`;
        })
        .exhaustive();
};

const ReportItemDetails = ({ reportId }: Props) => {
    const { data, isLoading, isError } = useReport(reportId);

    const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined);

    const [handleModalOpened, { open, close }] = useDisclosure();

    useEffect(() => {
        if (data) {
            getSourceUrl(data).then((r) => {
                setSourceUrl(r);
            });
        }
    }, [data]);

    if (isLoading) {
        return <CenteredLoading message={"Loading..."} />;
    } else if (isError) {
        return (
            <CenteredErrorMessage
                message={"Failed to load data. Please try again."}
            />
        );
    } else if (!data) {
        return null;
    }

    return (
        <Paper className={"w-full"}>
            <ReportHandleConfirmModal
                reportId={reportId}
                opened={handleModalOpened}
                onClose={close}
            />
            <Stack className={"w-full"}>
                <Group className={"w-full justify-around flex-nowrap"}>
                    <Paper
                        withBorder
                        radius={"sm"}
                        className={
                            "w-full lg:w-6/12 !bg-[#181818] h-[200px] relative"
                        }
                    >
                        <Box className={"absolute ms-3 mt-1"}>
                            <Text className={"text-sm text-dimmed"}>
                                Report creator
                            </Text>
                        </Box>
                        <Group
                            className={
                                "w-full h-full px-4 py-2 relative flex-nowrap"
                            }
                        >
                            <Box className={"w-5/12"}>
                                <UserAvatarGroup
                                    avatarProps={{
                                        size: "lg",
                                    }}
                                    groupProps={{
                                        wrap: "nowrap",
                                    }}
                                    userId={data.profileUserId}
                                />
                            </Box>
                            <Divider orientation="vertical" />
                            <Stack className={"w-7/12"}>
                                <Group>
                                    <Text fw={"bold"}>Category: </Text>
                                    <Tooltip
                                        label={reportCategoryToDescription(
                                            data.category,
                                        )}
                                    >
                                        <Text>
                                            {reportCategoryToString(
                                                data.category,
                                            )}
                                        </Text>
                                    </Tooltip>
                                </Group>
                                <Group className={"w-fit flex-nowrap"}>
                                    <Text fw={"bold"}>Source: </Text>
                                    <Text>
                                        {reportSourceTypeToString(
                                            data.sourceType,
                                        )}
                                    </Text>
                                </Group>
                                <Group className={"w-fit flex-nowrap"}>
                                    <Text fw={"bold"}>Created at: </Text>
                                    <Text>
                                        {new Date(
                                            data.createdAt,
                                        ).toLocaleString("en-US")}
                                    </Text>
                                </Group>
                                <Group className={"w-fit flex-nowrap"}>
                                    <Text fw={"bold"}>Status: </Text>
                                    <Badge
                                        color={data.isClosed ? "green" : "red"}
                                    >
                                        {data.isClosed ? "Closed" : "Open"}
                                    </Badge>
                                </Group>
                            </Stack>
                        </Group>
                    </Paper>
                    <Paper
                        withBorder
                        radius={"sm"}
                        className={
                            "w-full lg:w-6/12 !bg-[#181818] h-[200px] relative"
                        }
                    >
                        <Box className={"absolute ms-3 mt-1"}>
                            <Text className={"text-sm text-dimmed"}>
                                Take action
                            </Text>
                        </Box>
                        <Center className={"w-full h-full flex flex-col gap-3"}>
                            <Button onClick={open} disabled={data.isClosed}>
                                Handle
                            </Button>
                            {data.isClosed && (
                                <Text className={"text-sm text-dimmed"}>
                                    Report is already closed. No further action
                                    needed.
                                </Text>
                            )}
                        </Center>
                    </Paper>
                </Group>
                {data.reason != undefined && (
                    <Paper
                        withBorder
                        radius={"sm"}
                        className={
                            "w-full !bg-[#181818] min-h-fit h-[240px] relative"
                        }
                    >
                        <Box className={"absolute ms-3 mt-1"}>
                            <Text className={"text-sm text-dimmed"}>
                                Report reason
                            </Text>
                        </Box>
                        <Center className={"w-full h-full"}>
                            <Text>{data.reason}</Text>
                        </Center>
                    </Paper>
                )}
                <Group className={"w-full justify-between flex-nowrap"}>
                    <Paper
                        withBorder
                        radius={"sm"}
                        className={
                            "w-full lg:w-4/12 !bg-[#181818] h-[130px] relative"
                        }
                    >
                        <Box className={"absolute ms-1 mt-1"}>
                            <Text className={"text-sm text-dimmed"}>
                                Reported user
                            </Text>
                        </Box>
                        <Box className={"w-full h-full px-8 py-4"}>
                            <Center className={"w-full h-full"}>
                                <UserAvatarGroup
                                    avatarProps={{
                                        size: "lg",
                                    }}
                                    groupProps={{
                                        wrap: "nowrap",
                                    }}
                                    userId={data.targetProfileUserId}
                                />
                            </Center>
                        </Box>
                    </Paper>
                    <Paper
                        withBorder
                        radius={"sm"}
                        className={
                            "w-full lg:w-4/12 !bg-[#181818] h-[130px] relative"
                        }
                    >
                        <Box className={"absolute ms-3 mt-1"}>
                            <Text className={"text-sm text-dimmed"}>
                                View content
                            </Text>
                        </Box>
                        <Center className={"w-full h-full"}>
                            <MainAppLink href={`${sourceUrl}`}>
                                <Button
                                    loading={sourceUrl == undefined}
                                    variant={"outline"}
                                >
                                    Visit <IconExternalLink />
                                </Button>
                            </MainAppLink>
                        </Center>
                    </Paper>
                </Group>
            </Stack>
        </Paper>
    );
};

export default ReportItemDetails;
