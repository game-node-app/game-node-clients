import React, { RefObject } from "react";
import { GamePostEditor, Modal } from "@repo/ui";
import { IonFab, IonFabButton, IonFabList } from "@ionic/react";
import { IconArrowUp, IconMessage2Share, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { addIcons } from "ionicons";
import { readerOutline } from "ionicons/icons";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

addIcons({ readerOutline });

interface Props {
  contentRef: RefObject<HTMLIonContentElement | null>;
}

const HomeFab = ({ contentRef }: Props) => {
  return (
    <IonFab
      slot="fixed"
      horizontal="end"
      vertical="bottom"
      className={"me-2 mb-2"}
    >
      <IonFabButton
        onClick={() => {
          contentRef.current?.scrollToTop(500);
        }}
      >
        <IconArrowUp />
      </IonFabButton>
    </IonFab>
  );
};

export { HomeFab };
