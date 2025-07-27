import { IonFab, IonFabButton, IonFabList, useIonRouter } from "@ionic/react";
import React from "react";
import {
  IconDots,
  IconEye,
  IconHeartFilled,
  IconHeartPlus,
  IconLibrary,
  IconLibraryPlus,
  IconShare,
  IconStars,
  IconStarsFilled,
  IconTrashFilled,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import GameInfoShareModal from "@/components/game/info/share/GameInfoShareModal";
import {
  CollectionEntryEditModal,
  CollectionEntryRemoveModal,
  useOwnCollectionEntryForGameId,
  useReviewForUserIdAndGameId,
  useUserId,
} from "@repo/ui";
import GameInfoReviewCreateUpdateModal from "@/components/game/info/review/editor/GameInfoReviewCreateUpdateModal";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper.ts";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref.ts";

interface Props {
  gameId: number;
}

const GameInfoViewFab = ({ gameId }: Props) => {
  const userId = useUserId();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  const gameInLibrary =
    !collectionEntryQuery.isError && collectionEntryQuery.data != undefined;

  const gameInFavorites =
    gameInLibrary && collectionEntryQuery.data!.isFavorite;

  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);

  const hasReview = reviewQuery.data != undefined;

  const [addModalOpened, addModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [reviewModalOpened, reviewModalUtils] = useDisclosure();
  const [shareModalOpened, shareModalUtils] = useDisclosure();

  const collectionEntryFavoriteMutation = useMutation({
    mutationFn: (gameId: number) => {
      return CollectionsEntriesService.collectionsEntriesControllerChangeFavoriteStatusV1(
        gameId,
        {
          isFavorite: !gameInFavorites,
        },
      );
    },

    onSuccess: () => {
      collectionEntryQuery.invalidate();
    },
  });

  return (
    <IonFab
      slot="fixed"
      horizontal="end"
      vertical="bottom"
      className={"me-2 mb-2"}
    >
      <GameInfoShareModal
        gameId={gameId}
        opened={shareModalOpened}
        onClose={shareModalUtils.close}
      />
      <CollectionEntryEditModal
        id={gameId}
        onClose={addModalUtils.close}
        opened={addModalOpened}
      />
      <CollectionEntryRemoveModal
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
        gameId={gameId}
      />
      <GameInfoReviewCreateUpdateModal
        gameId={gameId}
        opened={reviewModalOpened}
        onClose={reviewModalUtils.close}
      />
      <IonFabButton
        onClick={() => {
          if (!gameInLibrary) {
            addModalUtils.open();
          }
        }}
      >
        {gameInLibrary ? <IconLibrary /> : <IconLibraryPlus />}
      </IonFabButton>
      {gameInLibrary && (
        <IonFabList side="top">
          <IonFabButton color={"danger"} onClick={removeModalUtils.open}>
            <IconTrashFilled />
          </IonFabButton>
          <IonFabButton color={"primary"} onClick={addModalUtils.open}>
            <IconDots />
          </IonFabButton>

          {hasReview && (
            <IonFabButton color={"primary"} onClick={shareModalUtils.open}>
              <IconShare />
            </IonFabButton>
          )}
          <IonFabButton color={"primary"} onClick={reviewModalUtils.open}>
            {hasReview ? <IconStarsFilled /> : <IconStars />}
          </IonFabButton>

          <IonFabButton
            color={"primary"}
            onClick={() => {
              collectionEntryFavoriteMutation.mutate(gameId);
            }}
          >
            {gameInFavorites ? <IconHeartFilled /> : <IconHeartPlus />}
          </IonFabButton>
        </IonFabList>
      )}
    </IonFab>
  );
};

export { GameInfoViewFab };
