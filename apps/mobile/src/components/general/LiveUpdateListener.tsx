import { Button, Group, Progress, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { useEffect, useRef } from "react";
import { useLiveUpdate } from "./useLiveUpdate";

const NOTIFICATION_ID = "mobile-live-update";

const LiveUpdateListener = () => {
  const { t } = useTranslation();
  const { state, restart, retry, dismiss } = useLiveUpdate();
  const visible = useRef(false);

  useEffect(() => {
    if (state.status === "idle") {
      if (visible.current) notifications.hide(NOTIFICATION_ID);
      visible.current = false;
      return;
    }

    const downloading = state.status === "downloading";
    const restarting = state.status === "restarting";
    const failed = state.status === "error";
    const title = downloading
      ? t("mobileLiveUpdate.downloadingTitle")
      : restarting
        ? t("mobileLiveUpdate.restartingTitle")
        : failed
          ? t("mobileLiveUpdate.errorTitle")
          : t("mobileLiveUpdate.readyTitle");
    const message = (
      <Stack gap="xs">
        {downloading ? (
          <>
            <Text size="sm" c="bright">
              {state.progress === null
                ? t("mobileLiveUpdate.downloading")
                : state.progress >= 100
                  ? t("mobileLiveUpdate.preparing")
                  : t("mobileLiveUpdate.downloadProgress", {
                      progress: Math.floor(state.progress),
                    })}
            </Text>
            {state.progress !== null && (
              <Progress
                value={state.progress}
                aria-label={t("mobileLiveUpdate.progressLabel")}
              />
            )}
          </>
        ) : (
          <Text size="sm" c="bright">
            {restarting
              ? t("mobileLiveUpdate.restarting")
              : failed
                ? state.phase === "restart"
                  ? t("mobileLiveUpdate.restartError")
                  : t("mobileLiveUpdate.downloadError")
                : t("mobileLiveUpdate.ready")}
          </Text>
        )}
        {!downloading && (
          <Group gap="xs">
            <Button
              size="sm"
              mih={44}
              onClick={() => void (failed ? retry() : restart())}
              loading={restarting}
              disabled={restarting}
            >
              {failed
                ? t("mobileLiveUpdate.retry")
                : t("mobileLiveUpdate.restartNow")}
            </Button>
            <Button
              size="sm"
              mih={44}
              variant="subtle"
              disabled={restarting}
              onClick={dismiss}
            >
              {failed
                ? t("mobileLiveUpdate.dismiss")
                : t("mobileLiveUpdate.later")}
            </Button>
          </Group>
        )}
      </Stack>
    );
    const notification = {
      id: NOTIFICATION_ID,
      title,
      message,
      color: failed ? "red" : undefined,
      loading: restarting || (downloading && state.progress === null),
      autoClose: false as const,
      withCloseButton: false,
    };
    if (visible.current) notifications.update(notification);
    else {
      notifications.show(notification);
      visible.current = true;
    }
  }, [state, restart, retry, dismiss, t]);

  useEffect(
    () => () => {
      if (visible.current) notifications.hide(NOTIFICATION_ID);
      visible.current = false;
    },
    [],
  );

  return null;
};

export default LiveUpdateListener;
