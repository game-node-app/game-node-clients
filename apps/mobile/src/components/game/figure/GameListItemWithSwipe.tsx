import React from "react";
import GameListItem, {
  IGameListFigureProps,
} from "@/components/game/figure/GameListItem";
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  CollectionEntryAddOrUpdateModal,
  CollectionEntryRemoveModal,
  useOwnCollectionEntryForGameId,
} from "@repo/ui";

type Props = IGameListFigureProps;

const GameListItemWithSwipe = ({ game, ...others }: Props) => {
  const collectionEntryQuery = useOwnCollectionEntryForGameId(game.id);
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();

  return (
    <IonItemSliding>
      <CollectionEntryAddOrUpdateModal
        id={game.id!}
        opened={addUpdateModalOpened}
        onClose={addUpdateModalUtils.close}
      />
      <CollectionEntryRemoveModal
        gameId={game.id!}
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
      />
      <IonItem routerLink={getTabAwareHref(`/game/${game.id}`)}>
        <GameListItem game={game} {...others}></GameListItem>
      </IonItem>
      <IonItemOptions>
        <IonItemOption onClick={addUpdateModalUtils.open}>
          {collectionEntryQuery.data ? <IconEdit /> : <IconPlus />}
        </IonItemOption>
        {collectionEntryQuery.data && (
          <IonItemOption className="bg-red-600" onClick={removeModalUtils.open}>
            <IconTrash />
          </IonItemOption>
        )}
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default GameListItemWithSwipe;
