import { Notification } from "@/wrapper/server";

export default function getUniqueProfileNames(notifications: Notification[]) {
    const profileNameMap = new Map<string, string>();
    for (const notification of notifications) {
        if (!notification.profile) continue;

        if (profileNameMap.has(notification.profile.username)) continue;

        profileNameMap.set(
            notification.profile.username,
            notification.profile.username,
        );
    }

    return [...profileNameMap.values()];
}
