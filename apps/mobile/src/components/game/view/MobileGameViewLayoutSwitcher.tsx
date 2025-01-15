import React, { SetStateAction, useContext } from "react";
import { IconLayoutColumns, IconLayoutList } from "@tabler/icons-react";
import { GameViewContext, GameViewLayoutOption } from "@/components/game/view/MobileGameView";
import { IonSegment, IonSegmentButton } from "@ionic/react";

interface IGameViewLayoutSwitcherProps {
    setLayout: React.Dispatch<SetStateAction<GameViewLayoutOption>>;
}

const MobileGameViewLayoutSwitcher = ({ setLayout }: IGameViewLayoutSwitcherProps) => {
    const { layout } = useContext(GameViewContext);

    const handleLayoutChange = (changeTo: GameViewLayoutOption) => {
        setLayout(changeTo);
    };

    return (
        <IonSegment value={layout}>
            <IonSegmentButton value={"grid"} onClick={() => handleLayoutChange("grid")}>
                <IconLayoutColumns />
            </IonSegmentButton>
            <IonSegmentButton value={"list"} onClick={() => handleLayoutChange("list")}>
                <IconLayoutList />
            </IonSegmentButton>
        </IonSegment>
    );
};

export default MobileGameViewLayoutSwitcher;
