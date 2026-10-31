import {
  ApiError,
  OwnUserConnectionDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group, Image, Paper, Stack, Text, Title } from "@mantine/core";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { Link } from "#@/util";
import { PreferencesConnectionModal } from "#@/components/preferences/handlers/connections/PreferencesConnectionModal";
import { useTranslation } from "@repo/locales";
import { getErrorMessage } from "#@/util/getErrorMessage";
import type = UserConnectionDto.type;

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
    <Paper
      className={"rounded"}
      styles={{
        root: {
          backgroundColor: "#161616",
        },
      }}
    >
      <Group className={"w-full h-full min-h-28 p-2 px-4 justify-between"}>
        <PreferencesConnectionModal
          type={type}
          opened={modalOpened}
          onClose={modalUtils.close}
        />
        <Group className="gap-3">
          <Image
            alt={t("preferences.labels.connectionIcon")}
            src={getServerStoredIcon(type.valueOf())}
            w={38}
            h={38}
          />
          <Stack gap={3}>
            {isConnected ? (
              <>
                <Title size={"h5"}>{userConnection.data!.sourceUsername}</Title>
                <Text c={requiresReauth ? "orange" : "dimmed"}>
                  {requiresReauth
                    ? t("preferences.statuses.reauthRequired")
                    : t("preferences.statuses.connected")}
                </Text>
              </>
            ) : isLookupError ? (
              <Text c="red">{getErrorMessage(userConnection.error)}</Text>
            ) : (
              <Text c="dimmed">{t("preferences.statuses.notConnected")}</Text>
            )}
          </Stack>
        </Group>

        <Group className={"ms-auto gap-2"}>
          {requiresReauth && (
            <Button
              color="yellow"
              variant="outline"
              onClick={modalUtils.open}
              aria-label={t("importer.connection.reconnect")}
            >
              {t("importer.connection.reconnect")}
            </Button>
          )}

          {isConnected && !requiresReauth && isEligible && (
            <Link href={`/importer/${type.valueOf()}`}>
              <Button
                variant="outline"
                aria-label={t("importer.connection.importGames")}
              >
                {t("importer.connection.importGames")}
              </Button>
            </Link>
          )}

          {isConnected ? (
            <Button
              variant="default"
              onClick={modalUtils.open}
              aria-label={t("importer.connection.configure")}
            >
              {t("importer.connection.configure")}
            </Button>
          ) : !isLookupError ? (
            <Button
              onClick={modalUtils.open}
              aria-label={t("importer.connection.connect")}
            >
              {t("importer.connection.connect")}
            </Button>
          ) : null}
        </Group>
      </Group>
    </Paper>
  );
};

export { PreferencesConnectionItem };
