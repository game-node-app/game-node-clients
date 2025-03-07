import React, { RefObject } from "react";
import { Modal, PostEditor } from "@repo/ui";
import { IonFab, IonFabButton, IonFabList } from "@ionic/react";
import { IconArrowUp, IconMessage2Share, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { addIcons } from "ionicons";
import { readerOutline } from "ionicons/icons";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

addIcons({ readerOutline });

interface Props {
  contentRef: RefObject<HTMLIonContentElement>;
}

const HomeFab = ({ contentRef }: Props) => {
  const [createPostModalOpened, createPostModalUtils] = useDisclosure();

  return (
    <IonFab
      slot="fixed"
      horizontal="end"
      vertical="bottom"
      className={"me-2 mb-2"}
    >
      <Modal
        opened={createPostModalOpened}
        onClose={createPostModalUtils.close}
        title={"Publish post"}
        breakpoints={[0.5, 0.75, 0.85, 1]}
        initialBreakpoint={1}
      >
        <SessionAuth>
          <PostEditor
            editorProps={{
              mih: "50vh",
            }}
            onPublish={createPostModalUtils.close}
          />
        </SessionAuth>
      </Modal>
      <IonFabButton>
        <IconPlus />
      </IonFabButton>
      <IonFabList side={"top"}>
        <IonFabButton
          color={"primary"}
          onClick={() => {
            createPostModalUtils.open();
          }}
        >
          <IconMessage2Share />
        </IonFabButton>
        <IonFabButton
          color={"primary"}
          onClick={() => {
            contentRef.current?.scrollToTop(500);
          }}
        >
          <IconArrowUp />
        </IonFabButton>
      </IonFabList>
    </IonFab>
  );
};

export { HomeFab };
