import React, { useCallback, useEffect, useMemo } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Center,
    Group,
    Popover,
    ScrollArea,
    Skeleton,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconBell, IconBellFilled } from "@tabler/icons-react";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import AggregatedNotification from "@/components/notifications/AggregatedNotification";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { Notification, NotificationsService } from "@/wrapper/server";
import { useInfiniteAggregatedNotifications } from "@/components/notifications/hooks/useInfiniteAggregatedNotifications";
import CenteredLoading from "@/components/general/CenteredLoading";

const GlobalShellHeaderNotifications = () => {
    const [isPopoverOpened, popoverUtils] = useDisclosure();
    const onMobile = useOnMobile();

    const { data, isLoading, isError, invalidate, isFetching, fetchNextPage } =
        useInfiniteAggregatedNotifications();

    const notificationViewMutation = useMutation({
        mutationFn: async (notifications: Notification[]) => {
            if (notifications == undefined || notifications.length === 0)
                return false;

            const hasUnreadNotifications = notifications.some(
                (notification) => !notification.isViewed,
            );
            if (!hasUnreadNotifications) {
                return false;
            }

            const ids = notifications.map((notification) => notification.id);

            await NotificationsService.notificationsControllerUpdateViewedStatusV1(
                {
                    isViewed: true,
                    notificationIds: ids,
                },
            );

            return true;
        },
        onSuccess: (shouldInvalidate) => {
            if (shouldInvalidate) {
                invalidate();
            }
        },
    });

    const aggregations = useMemo(() => {
        return data?.pages.flatMap((response) =>
            response.data.map((aggregation) => aggregation),
        );
    }, [data?.pages]);

    const lastElement = data?.pages[data?.pages.length - 1];
    const hasNextPage =
        lastElement != undefined && lastElement.pagination.hasNextPage;

    const isEmpty =
        !isLoading && (aggregations == undefined || aggregations.length === 0);

    const hasUnreadNotifications = useMemo((): boolean => {
        if (aggregations == undefined || aggregations.length === 0)
            return false;

        for (const aggregation of aggregations) {
            const unread = aggregation.notifications.some(
                (notification) => !notification.isViewed,
            );
            if (unread) return true;
        }
        return false;
    }, [aggregations]);

    return (
        <Popover
            width={onMobile ? 320 : 350}
            position={onMobile ? "bottom" : "left-start"}
            offset={13}
            withArrow
            shadow="md"
            opened={isPopoverOpened}
        >
            <Popover.Target>
                <ActionIcon
                    c={hasUnreadNotifications ? "brand" : "unset"}
                    variant={"transparent"}
                    onClick={popoverUtils.toggle}
                >
                    {hasUnreadNotifications ? <IconBellFilled /> : <IconBell />}
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                <ScrollArea.Autosize mah={400}>
                    <Stack w={"100%"} h={"100%"} align={"center"} gap={0}>
                        <Group
                            w={"100%"}
                            justify={"space-between"}
                            className={"p-2 mx-6 bg-[#111111]"}
                        >
                            <Group gap={5}>
                                {hasUnreadNotifications ? (
                                    <IconBellFilled size={"1.8rem"} />
                                ) : (
                                    <IconBell size={"1.8rem"} />
                                )}
                                <Title size={"h4"}>Notifications</Title>
                            </Group>
                            <ActionIcon
                                variant={"transparent"}
                                onClick={() => {
                                    const unreadNotifications = aggregations
                                        ?.filter((aggregation) => {
                                            return aggregation.notifications.filter(
                                                (notification) =>
                                                    !notification.isViewed,
                                            );
                                        })
                                        .flatMap(
                                            (aggregate) =>
                                                aggregate.notifications,
                                        );
                                    if (
                                        unreadNotifications &&
                                        unreadNotifications.length > 0
                                    ) {
                                        console.log(
                                            `Marking ${unreadNotifications.length} notifications as read`,
                                        );
                                        notificationViewMutation.mutate(
                                            unreadNotifications,
                                        );
                                    }
                                }}
                            >
                                <svg
                                    width="28"
                                    height="30"
                                    viewBox="0 0 24 27"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0 13.8463C0 12.5015 0.541725 11.2133 1.50287 10.2728L8.50286 3.42238C10.4464 1.52041 13.5536 1.52041 15.4971 3.42238L22.4971 10.2728C23.4583 11.2133 24 12.5015 24 13.8463V22C24 24.7614 21.7614 27 19 27H5C2.23858 27 0 24.7614 0 22V13.8463Z"
                                        fill="#D9D9D9"
                                    />
                                    <path
                                        d="M6 16.6512L9.54098 20L18 12"
                                        stroke="#F15025"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </ActionIcon>
                        </Group>
                        {aggregations?.map((aggregatedNotification, index) => {
                            if (
                                aggregatedNotification.notifications.length ===
                                0
                            ) {
                                return null;
                            }

                            const key = aggregatedNotification.notifications
                                .map((notif) => notif.id)
                                .join(",");

                            return (
                                <AggregatedNotification
                                    key={key}
                                    aggregatedNotification={
                                        aggregatedNotification
                                    }
                                    backgroundColor={
                                        index === 0 || index % 2 === 0
                                            ? "normal"
                                            : "darker"
                                    }
                                    onClick={() => {
                                        popoverUtils.close();
                                        if (
                                            notificationViewMutation.isPending ||
                                            isFetching
                                        ) {
                                            return;
                                        }
                                        notificationViewMutation.mutate(
                                            aggregatedNotification.notifications,
                                        );
                                    }}
                                />
                            );
                        })}
                        {isEmpty && <Text>No notifications.</Text>}
                        {isFetching && <CenteredLoading className={"my-4"} />}

                        {hasNextPage && (
                            <Center>
                                <Button
                                    size={"md"}
                                    onClick={() => {
                                        fetchNextPage();
                                    }}
                                >
                                    Show more
                                </Button>
                            </Center>
                        )}
                    </Stack>
                </ScrollArea.Autosize>
            </Popover.Dropdown>
        </Popover>
    );
};

export default GlobalShellHeaderNotifications;
