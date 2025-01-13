import { useQuery } from "@tanstack/react-query";
import { ImporterWatchService } from "@/wrapper/server";

export function useImporterNotification(notificationId: number) {
    return useQuery({
        queryKey: ["importer", "watch", "notification", notificationId],
        queryFn: async () => {
            return ImporterWatchService.importerWatchControllerFindNotificationV1(
                notificationId,
            );
        },
        retry: 1,
        staleTime: Infinity,
    });
}
