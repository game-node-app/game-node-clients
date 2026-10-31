import { AppPage } from "@/components/general/AppPage";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Button, Center, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  acknowledgeNotificationsRead,
  AggregatedNotification,
  CenteredLoading,
  useInfiniteAggregatedNotifications,
} from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SessionAuth } from "@repo/ui";

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, invalidate, isFetching, fetchNextPage } =
    useInfiniteAggregatedNotifications();

  const queryClient = useQueryClient();

  const notificationViewMutation = useMutation({
    mutationFn: acknowledgeNotificationsRead,
    onSuccess: (shouldInvalidate) => {
      if (shouldInvalidate) {
        invalidate();
      }
    },
  });

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data?.pages]);

  const lastPage = data?.pages[data?.pages.length - 1];
  const hasNextPage = lastPage?.pagination.hasMore;

  const isEmpty = !isLoading && items.length === 0;

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
            {items.map((item, index) => {
              return (
                <AggregatedNotification
                  key={`${item.id}-${item.version}`}
                  aggregatedNotification={item}
                  backgroundColor={
                    index === 0 || index % 2 === 0 ? "normal" : "darker"
                  }
                  onClick={() => {
                    if (notificationViewMutation.isPending || isFetching) {
                      return;
                    }
                    notificationViewMutation.mutate([item]);
                  }}
                />
              );
            })}
            {isEmpty && <Text>{t("notifications.empty")}</Text>}
            {isFetching && <CenteredLoading className={"my-4"} />}

            {hasNextPage && (
              <Center className={"mt-4"}>
                <Button
                  size={"sm"}
                  onClick={() => {
                    fetchNextPage();
                  }}
                >
                  {t("actions.showMore")}
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