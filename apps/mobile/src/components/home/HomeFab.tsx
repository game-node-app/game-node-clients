import { IonFab, IonFabButton } from "@ionic/react";
import { IconArrowUp } from "@tabler/icons-react";
import { addIcons } from "ionicons";
import { readerOutline } from "ionicons/icons";
import { RefObject } from "react";

addIcons({ readerOutline });

interface Props {
  contentRef: RefObject<
    | import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    | null
  >;
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
