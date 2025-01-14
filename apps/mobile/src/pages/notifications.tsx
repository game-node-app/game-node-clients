import React, { useMemo } from "react";
import { useInfiniteAggregatedNotifications } from "@/components/notifications/hooks/useInfiniteAggregatedNotifications";
import { useMutation } from "@tanstack/react-query";
import { NotificationsService } from "@/wrapper/server";
import { Notification } from "@/wrapper/server";
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { ActionIcon, Button, Center, Container, Stack, Text } from "@mantine/core";
import AggregatedNotification from "@/components/notifications/AggregatedNotification";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconInbox, IconInboxOff } from "@tabler/icons-react";

const NotificationsPage = () => {
    const { data, isLoading, isError, invalidate, isFetching, fetchNextPage } = useInfiniteAggregatedNotifications();

    const notificationViewMutation = useMutation({
        mutationFn: async (notifications: Notification[]) => {
            if (notifications == undefined || notifications.length === 0) return false;

            const hasUnreadNotifications = notifications.some((notification) => !notification.isViewed);
            if (!hasUnreadNotifications) {
                return false;
            }

            const ids = notifications.map((notification) => notification.id);

            await NotificationsService.notificationsControllerUpdateViewedStatusV1({
                isViewed: true,
                notificationIds: ids,
            });

            return true;
        },
        onSuccess: (shouldInvalidate) => {
            if (shouldInvalidate) {
                invalidate();
            }
        },
    });

    const aggregations = useMemo(() => {
        return data?.pages.flatMap((response) => response.data.map((aggregation) => aggregation));
    }, [data?.pages]);

    const lastElement = data?.pages[data?.pages.length - 1];
    const hasNextPage = lastElement != undefined && lastElement.pagination.hasNextPage;

    const isEmpty = !isLoading && (aggregations == undefined || aggregations.length === 0);

    const hasUnreadNotifications = useMemo((): boolean => {
        if (aggregations == undefined || aggregations.length === 0) return false;

        for (const aggregation of aggregations) {
            const unread = aggregation.notifications.some((notification) => !notification.isViewed);
            if (unread) return true;
        }
        return false;
    }, [aggregations]);

    const markAllAsRead = () => {
        const unreadNotifications = aggregations
            ?.filter((aggregation) => {
                return aggregation.notifications.some((notification) => !notification.isViewed);
            })
            .flatMap((aggregate) => aggregate.notifications);

        if (unreadNotifications && unreadNotifications.length > 0) {
            console.log(`Marking ${unreadNotifications.length} notifications as read`);
            notificationViewMutation.mutate(unreadNotifications);
        }
    };

    return (
        <IonPage>
            <SessionAuth>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot={"start"}>
                            <IonBackButton />
                        </IonButtons>
                        <IonTitle>Notifications</IonTitle>
                        <IonButtons slot={"primary"}>
                            <IonButton onClick={markAllAsRead}>
                                {hasUnreadNotifications ? (
                                    <ActionIcon>
                                        <IconInboxOff />
                                    </ActionIcon>
                                ) : (
                                    <IconInbox />
                                )}
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Container fluid className={"min-h-screen p-0 mb-4"}>
                        <Stack w={"100%"} h={"100%"} align={"center"} gap={0}>
                            {aggregations?.map((aggregatedNotification, index) => {
                                if (aggregatedNotification.notifications.length === 0) {
                                    return null;
                                }

                                const key = aggregatedNotification.notifications.map((notif) => notif.id).join(",");

                                return (
                                    <AggregatedNotification
                                        key={key}
                                        aggregatedNotification={aggregatedNotification}
                                        backgroundColor={index === 0 || index % 2 === 0 ? "normal" : "darker"}
                                        onClick={() => {
                                            if (notificationViewMutation.isPending || isFetching) {
                                                return;
                                            }
                                            notificationViewMutation.mutate(aggregatedNotification.notifications);
                                        }}
                                    />
                                );
                            })}
                            {isEmpty && <Text>No notifications.</Text>}
                            {isFetching && <CenteredLoading className={"my-4"} />}

                            {hasNextPage && (
                                <Center className={"mt-4"}>
                                    <Button
                                        size={"sm"}
                                        onClick={() => {
                                            fetchNextPage();
                                        }}
                                    >
                                        Show more
                                    </Button>
                                </Center>
                            )}
                        </Stack>
                    </Container>
                </IonContent>
            </SessionAuth>
        </IonPage>
    );
};

export default NotificationsPage;
