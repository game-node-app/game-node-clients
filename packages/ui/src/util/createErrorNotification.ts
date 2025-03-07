import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "#@/util/getErrorMessage.ts";

export function createErrorNotification(err: Error) {
  console.error(err);
  notifications.show({
    color: "red",
    message: getErrorMessage(err),
  });
}
