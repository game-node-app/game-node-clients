import { UserConnectionDto } from "../../../../../../wrapper/src/server";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { PreferencesConnectionModal } from "#@/components/preferences/handlers/connections/PreferencesConnectionModal";
import { useTranslation } from "@repo/locales";
import type = UserConnectionDto.type;

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
    <Paper
      className={"rounded"}
      styles={{
        root: {
          backgroundColor: "#161616",
        },
      }}
    >
      <Group className={"w-full h-full min-h-28 p-2 px-4"}>
        <PreferencesConnectionModal
          type={type}
          opened={modalOpened}
          onClose={modalUtils.close}
        />
        <Image
          alt={t("preferences.labels.connectionIcon")}
          src={getServerStoredIcon(type.valueOf())}
          w={38}
          h={38}
        />
        <Stack gap={3}>
          {userConnection.data ? (
            <>
              <Title size={"h5"}>{userConnection.data.sourceUsername}</Title>
              <Text c={requiresReauth ? "orange" : "dimmed"}>
                {requiresReauth
                  ? t("preferences.statuses.reauthRequired")
                  : t("preferences.statuses.connected")}
              </Text>
            </>
          ) : (
            <>
              <Text>{t("preferences.statuses.notConnected")}</Text>
            </>
          )}
        </Stack>
        <Group className={"ms-auto me-4"}>
          {requiresReauth && (
            <Button onClick={modalUtils.open}>
              {t("preferences.actions.reconnect")}
            </Button>
          )}
          <Switch
            aria-label={t("preferences.titles.connectionSetup")}
            checked={userConnection.data != undefined}
            onChange={() => {
              modalUtils.open();
            }}
          />
        </Group>
      </Group>
    </Paper>
  );
};

export { PreferencesConnectionItem };
