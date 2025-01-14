import React from "react";
import GameListItem, { IGameListFigureProps } from "@/components/game/figure/GameListItem";
import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useOwnCollectionEntryForGameId } from "@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { useDisclosure } from "@mantine/hooks";
import CollectionEntryAddOrUpdateModal from "@/components/collection/collection-entry/form/modal/CollectionEntryAddOrUpdateModal";
import CollectionEntryRemoveModal from "@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { getTabAwareHref } from "@/util/getTabAwareHref";

interface Props extends IGameListFigureProps {}

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
            <CollectionEntryRemoveModal gameId={game.id!} opened={removeModalOpened} onClose={removeModalUtils.close} />
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
