import React from "react";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  userId: string;
  collectionId?: string;
}

const LibraryViewRefresher = ({ userId, collectionId }: Props) => {
  const queryClient = useQueryClient();

  return (
    <IonRefresher
      slot={"fixed"}
      onIonRefresh={async (evt) => {
        const promises = [
          queryClient.invalidateQueries({
            queryKey: ["library", userId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["collection-entries", "all", userId],
          }),
        ];

        if (collectionId) {
          promises.push(
            ...[
              queryClient.invalidateQueries({
                queryKey: ["collection", collectionId],
              }),
              queryClient.invalidateQueries({
                queryKey: ["collection-entries", collectionId],
              }),
            ],
          );
        }
        await Promise.all(promises);
        evt.detail.complete();
      }}
    >
      <IonRefresherContent />
    </IonRefresher>
  );
};

export { LibraryViewRefresher };
