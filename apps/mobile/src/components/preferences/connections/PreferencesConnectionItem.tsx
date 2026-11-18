import {
  ApiError,
  OwnUserConnectionDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group, Image, Stack, Text } from "@mantine/core";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { IonItem, IonLabel } from "@ionic/react";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  getConnectionName,
  getErrorMessage,
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

  const isLookupError =
    userConnection.error &&
    !(
      userConnection.error instanceof ApiError &&
      userConnection.error.status === 404
    );

  const requiresReauth =
    userConnection.data?.authStatus ===
    OwnUserConnectionDto.authStatus.REAUTH_REQUIRED;

  const isConnected = userConnection.data != null;
  const isEligible = Boolean(userConnection.data?.isImporterViable);

  return (
    <IonItem className="[--padding-start:12px] [--inner-padding-end:12px] sm:[--padding-start:16px] sm:[--inner-padding-end:16px]">
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
      <Group gap={8} className="w-full min-w-0 py-2">
        <Group gap={8} wrap="nowrap" className="min-w-0 flex-1 basis-36">
          <Image
            alt={t("preferences.labels.connectionIcon")}
            src={getServerStoredIcon(type.valueOf())}
            className="shrink-0 object-contain"
            w={28}
            h={28}
          />
          <Stack gap={2} className="min-w-0 [overflow-wrap:anywhere]">
            <IonLabel>{getConnectionName(type)}</IonLabel>
            {isConnected ? (
              <>
                <Text size="sm" fw={500}>
                  {userConnection.data!.sourceUsername}
                </Text>
                <Text size="xs" c={requiresReauth ? "orange" : "dimmed"}>
                  {requiresReauth
                    ? t("preferences.statuses.reauthRequired")
                    : t("preferences.statuses.connected")}
                </Text>
              </>
            ) : isLookupError ? (
              <Text size="xs" c="red">
                {getErrorMessage(userConnection.error)}
              </Text>
            ) : (
              <Text size="xs" c="dimmed">
                {t("preferences.statuses.notConnected")}
              </Text>
            )}
          </Stack>
        </Group>

        <Group gap={6} justify="flex-end" className="ms-auto max-w-full">
          {requiresReauth && (
            <Button
              size="xs"
              color="yellow"
              variant="outline"
              onClick={modalUtils.open}
              aria-label={t("importer.connection.reconnect")}
            >
              {t("importer.connection.reconnect")}
            </Button>
          )}

          {isConnected && !requiresReauth && isEligible && (
            <Button
              component={Link}
              to={getTabAwareHref(`/importer/${type.valueOf()}`)}
              size="xs"
              variant="outline"
            >
              {t("importer.connection.importGames")}
            </Button>
          )}

          {isConnected ? (
            <Button
              size="xs"
              variant="default"
              onClick={modalUtils.open}
              aria-label={t("importer.connection.configure")}
            >
              {t("importer.connection.configure")}
            </Button>
          ) : !isLookupError ? (
            <Button
              size="xs"
              onClick={modalUtils.open}
              aria-label={t("importer.connection.connect")}
            >
              {t("importer.connection.connect")}
            </Button>
          ) : null}
        </Group>
      </Group>
    </IonItem>
  );
};

export default PreferencesConnectionItem;
