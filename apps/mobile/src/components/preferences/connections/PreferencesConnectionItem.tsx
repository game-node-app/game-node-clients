import { UserConnectionDto } from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group, Image } from "@mantine/core";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";
import {
  getConnectionName,
  getServerStoredIcon,
  PreferencesConnectionModal,
  useOwnUserConnectionByType,
} from "@repo/ui";
import type = UserConnectionDto.type;
import { useTranslation } from "@repo/locales";

interface Props {
  type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
  const { t } = useTranslation();
  const userConnection = useOwnUserConnectionByType(type);
  const [modalOpened, modalUtils] = useDisclosure();
  const requiresReauth =
    userConnection.data?.authStatus ===
    UserConnectionDto.authStatus.REAUTH_REQUIRED;

  return (
    <IonItem className={"relative"}>
      <PreferencesConnectionModal
        type={type}
        opened={modalOpened}
        onClose={modalUtils.close}
        onRedirect={
          Capacitor.isNativePlatform()
            ? async (url) => {
                await Browser.open({ url });
              }
            : undefined
        }
      />
      <Group className={"gap-2"}>
        <Image
          alt={t("preferences.labels.connectionIcon")}
          src={getServerStoredIcon(type.valueOf())}
          className="object-contain"
          w={28}
          h={28}
        />
        <IonLabel>
          {getConnectionName(type)}
          {requiresReauth && <p>{t("preferences.statuses.reauthRequired")}</p>}
        </IonLabel>
      </Group>
      <Group className={"ms-auto"}>
        {requiresReauth && (
          <Button onClick={modalUtils.open}>
            {t("preferences.actions.reconnect")}
          </Button>
        )}
        <IonToggle
          aria-label={t("preferences.titles.connectionSetup")}
          checked={userConnection.data != undefined}
          onClick={(evt) => {
            evt.preventDefault();
            modalUtils.open();
          }}
        ></IonToggle>
      </Group>
    </IonItem>
  );
};

export default PreferencesConnectionItem;
