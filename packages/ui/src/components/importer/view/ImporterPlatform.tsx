import { getConnectionName } from "#@/components";
import { Link } from "#@/util";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { Badge, Box, Button, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { OwnUserConnectionDto } from "@repo/wrapper/server";
import { useMemo } from "react";

interface Props {
  connection: OwnUserConnectionDto;
}

const ImporterPlatform = ({ connection }: Props) => {
  const { t, i18n } = useTranslation();
  const connectionName = useMemo(
    () =>
      getConnectionName(
        connection.type as import("@repo/wrapper/server").UserConnectionDto.type,
      ),
    [connection.type],
  );

  const isReauthRequired =
    connection.authStatus === OwnUserConnectionDto.authStatus.REAUTH_REQUIRED;

  const formattedLastSynced = useMemo(() => {
    if (!connection.lastSyncedAt) return null;
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
  }, [connection.lastSyncedAt, i18n.language]);

  const action = isReauthRequired ? (
    <Link href="/preferences/connections" className={"shrink-0"}>
      <Button color="yellow" variant="light" size="sm">
        {t("importer.connection.reconnect")}
      </Button>
    </Link>
  ) : (
    <Link
      href={`/importer/${connection.type.valueOf()}`}
      className={"shrink-0"}
    >
      <Button size="sm" rightSection={<IconChevronRight size={16} />}>
        {t("importer.buttons.import")}
      </Button>
    </Link>
  );

  return (
    <Group
      wrap="nowrap"
      gap="md"
      className={
        "w-full max-w-xl rounded-xl border border-solid border-[#2a2a2a] bg-[#141414] p-4"
      }
    >
      <Box
        className={
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1f1f1f]"
        }
      >
        <Image
          alt={"Importer source icon"}
          src={getServerStoredIcon(connection.type.valueOf())}
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
        ) : connection.unprocessedCount != null ? (
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
        ) : null}

        {formattedLastSynced && (
          <Text size="xs" c="dimmed" lh={1.3}>
            {t("importer.connection.lastSynced", { time: formattedLastSynced })}
          </Text>
        )}
      </Stack>
      {action}
    </Group>
  );
};

export { ImporterPlatform };
