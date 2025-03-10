import { Notification } from "@repo/wrapper/server";

export function getUniqueProfileNames(notifications: Notification[]) {
  const profileNames = notifications
    .map((notification) => notification.profile?.username)
    .filter((username) => username != undefined);

  return Array.from(new Set(profileNames));
}
