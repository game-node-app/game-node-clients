import { getConnectionName } from "#@/components";
import { Link } from "#@/util";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { Badge, Button, Image, Stack, Text, Title } from "@mantine/core";
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

  return (
    <Stack
      className={
        "h-auto min-h-64 w-60 items-center bg-[#141414] p-4 rounded-md justify-between"
      }
    >
      <Stack className="items-center" gap="xs">
        <Image
          alt={"Importer source icon"}
          src={getServerStoredIcon(connection.type.valueOf())}
          w={48}
          h={48}
          className={"mt-2"}
        />
        <Title size={"h4"}>{connectionName}</Title>

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
          <Text size="xs" c="dimmed" ta="center">
            {t("importer.connection.lastSynced", { time: formattedLastSynced })}
          </Text>
        )}
      </Stack>

      {isReauthRequired ? (
        <Link href="/preferences/connections" className={"w-full mt-auto mb-2"}>
          <Button color="yellow" variant="outline" className={"w-full"}>
            {t("importer.connection.reconnect")}
          </Button>
        </Link>
      ) : (
        <Link
          href={`/importer/${connection.type.valueOf()}`}
          className={"w-full mt-auto mb-2"}
        >
          <Button className={"w-full"}>{t("importer.buttons.import")}</Button>
        </Link>
      )}
    </Stack>
  );
};

export { ImporterPlatform };
