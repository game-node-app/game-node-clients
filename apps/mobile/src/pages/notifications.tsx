import React, { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification, NotificationsService } from "@repo/wrapper/server";
import { IonPage, IonRefresher, IonRefresherContent } from "@ionic/react";
import { Button, Center, Stack, Text } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  AggregatedNotification,
  CenteredLoading,
  useInfiniteAggregatedNotifications,
} from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";

const NotificationsPage = () => {
  const { data, isLoading, invalidate, isFetching, fetchNextPage } =
    useInfiniteAggregatedNotifications();

  const queryClient = useQueryClient();

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
    if (aggregations == undefined || aggregations.length === 0) return false;

    for (const aggregation of aggregations) {
      const unread = aggregation.notifications.some(
        (notification) => !notification.isViewed,
      );
      if (unread) return true;
    }
    return false;
  }, [aggregations]);

  const markAllAsRead = () => {
    const unreadNotifications = aggregations
      ?.filter((aggregation) => {
        return aggregation.notifications.some(
          (notification) => !notification.isViewed,
        );
      })
      .flatMap((aggregate) => aggregate.notifications);

    if (unreadNotifications && unreadNotifications.length > 0) {
      console.log(
        `Marking ${unreadNotifications.length} notifications as read`,
      );
      notificationViewMutation.mutate(unreadNotifications);
    }
  };

  return (
    <AppPage
      contentProps={{
        fixedSlotPlacement: "before",
      }}
      withMenuButton
    >
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["notifications"],
            }),
          ];

          await Promise.all(promises);

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SessionAuth>
        <Stack className={"min-h-screen p-0 mb-4"}>
          <Stack w={"100%"} h={"100%"} align={"center"} gap={0}>
            {aggregations?.map((aggregatedNotification, index) => {
              if (aggregatedNotification.notifications.length === 0) {
                return null;
              }

              const key = aggregatedNotification.notifications
                .map((notif) => notif.id)
                .join(",");

              return (
                <AggregatedNotification
                  key={key}
                  aggregatedNotification={aggregatedNotification}
                  backgroundColor={
                    index === 0 || index % 2 === 0 ? "normal" : "darker"
                  }
                  onClick={() => {
                    if (notificationViewMutation.isPending || isFetching) {
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
        </Stack>
      </SessionAuth>
    </AppPage>
  );
};

export default NotificationsPage;
