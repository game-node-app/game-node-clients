import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { PreferencesConnectionModal } from "#@/components/preferences/handlers/connections/PreferencesConnectionModal";
import { useOpenExternalUrl } from "#@/context";
import { Link } from "#@/util";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import {
  Badge,
  Box,
  Button,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { OwnUserConnectionDto, UserConnectionDto } from "@repo/wrapper/server";
import { useMemo } from "react";

interface Props {
  /** Importer source, taken from the available connections list. */
  type: UserConnectionDto.type;
  /** Server-supplied display name, used for sources newer than this client. */
  name?: string;
  /** Server-supplied icon filename, used for sources newer than this client. */
  iconName?: string;
  /** The current user's connection for this source, when there is one. */
  connection?: OwnUserConnectionDto | null;
}

/**
 * One importable platform card. Connected platforms open their queue;
 * platforms without a connection offer the setup modal in place.
 */
const ImporterPlatform = ({ type, name, iconName, connection }: Props) => {
  const { t, i18n } = useTranslation();
  const openExternalUrl = useOpenExternalUrl();
  const [setupOpened, setupHandlers] = useDisclosure(false);
  const connectionName = useMemo(() => {
    // The server can list types newer than this client's wrapper
    // (getConnectionName would throw), so fall back to the server name.
    if (Object.values<string>(UserConnectionDto.type).includes(type)) {
      return getConnectionName(type);
    }
    return name ?? type;
  }, [name, type]);

  const isConnected = connection != null;
  const isReauthRequired =
    connection?.authStatus === OwnUserConnectionDto.authStatus.REAUTH_REQUIRED;

  const formattedLastSynced = useMemo(() => {
    if (!connection?.lastSyncedAt) return null;
    try {
      const date = new Date(connection.lastSyncedAt);
      if (isNaN(date.getTime())) return null;
      return new Intl.DateTimeFormat(i18n.language || "en", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    } catch {
      return null;
    }
  }, [connection?.lastSyncedAt, i18n.language]);

  const action = isReauthRequired ? (
    <Link href="/preferences/connections" className={"shrink-0"}>
      <Button color="yellow" variant="light" size="sm">
        {t("importer.connection.reconnect")}
      </Button>
    </Link>
  ) : isConnected ? (
    <Link href={`/importer/${type.valueOf()}`} className={"shrink-0"}>
      <Button size="sm" rightSection={<IconChevronRight size={16} />}>
        {t("importer.buttons.import")}
      </Button>
    </Link>
  ) : (
    <Button size="sm" className={"shrink-0"} onClick={setupHandlers.open}>
      {t("importer.connection.connect")}
    </Button>
  );

  return (
    <>
      {setupOpened && (
        <PreferencesConnectionModal
          type={type}
          opened={setupOpened}
          onClose={setupHandlers.close}
          onRedirect={openExternalUrl}
        />
      )}
      <Group
        wrap="nowrap"
        gap="md"
        className={
          "w-full max-w-xl rounded-xl border border-solid border-line bg-panel p-4"
        }
      >
        <Box
          className={
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-panel-inset"
          }
        >
          <Image
            alt={t("preferences.labels.connectionIcon")}
            src={getServerStoredIcon(iconName ?? type.valueOf())}
            w={32}
            h={32}
          />
        </Box>
        <Stack gap={6} className={"min-w-0 flex-1 items-start"}>
          <Title order={4} size={"h5"} lh={1.2}>
            {connectionName}
          </Title>

          {isReauthRequired ? (
            <Badge color="yellow" variant="light" size="sm">
              {t("importer.connection.reauthRequired")}
            </Badge>
          ) : connection?.unprocessedCount != null ? (
            connection.unprocessedCount > 0 ? (
              <Badge color="blue" variant="filled" size="sm">
                {t("importer.connection.availableCount", {
                  count: connection.unprocessedCount,
                })}
              </Badge>
            ) : (
              <Badge color="teal" variant="light" size="sm">
                {t("importer.connection.allCaughtUp")}
              </Badge>
            )
          ) : !isConnected ? (
            <Text size="xs" c="dimmed" lh={1.3}>
              {t("importer.connection.notConnected")}
            </Text>
          ) : null}

          {formattedLastSynced && (
            <Text size="xs" c="dimmed" lh={1.3}>
              {t("importer.connection.lastSynced", {
                time: formattedLastSynced,
              })}
            </Text>
          )}
        </Stack>
        {action}
      </Group>
    </>
  );
};

export { ImporterPlatform };
