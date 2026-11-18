import { useOwnUserConnections } from "#@/components/connections/hooks/useOwnUserConnections";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { useFormatLocale } from "#@/components/events/util/format";
import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  OwnUserConnectionDto,
  type UserConnectionDto,
} from "@repo/wrapper/server";

const storesWithoutHistory = new Set([
  OwnUserConnectionDto.type.XBOX,
  OwnUserConnectionDto.type.EPICGAMES,
  OwnUserConnectionDto.type.GOG,
]);

export function RecapStoreSync() {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const { data: connections } = useOwnUserConnections({
    refetchOnMount: "always",
  });

  if (!connections?.length) return null;

  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
  const stores = connections
    .filter(({ type }) => storesWithoutHistory.has(type))
    .map(({ type }) => getConnectionName(type as UserConnectionDto.type));
  const storesLabel = new Intl.ListFormat(locale).format(stores);

  return (
    <Paper component="section" withBorder radius="lg" p="md">
      <Stack gap="sm">
        <div>
          <Title order={2} size="h5">
            {t("recap.playtime.syncTitle")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("recap.playtime.syncDelay")}
          </Text>
        </div>
        <SimpleGrid
          component="ul"
          cols={{ base: 2, sm: 3 }}
          spacing="sm"
          m={0}
          p={0}
          className="list-none"
        >
          {connections.map(({ type, lastSyncedAt }) => {
            const date = lastSyncedAt ? new Date(lastSyncedAt) : null;

            return (
              <li key={type}>
                <Text size="sm" fw={600}>
                  {getConnectionName(type as UserConnectionDto.type)}
                </Text>
                <Text size="sm" c="dimmed">
                  {date && Number.isFinite(date.getTime()) ? (
                    <time dateTime={date.toISOString()}>
                      {dateFormat.format(date)}
                    </time>
                  ) : (
                    t("recap.playtime.noSync")
                  )}
                </Text>
              </li>
            );
          })}
        </SimpleGrid>
        {stores.length > 0 && (
          <Text size="sm" c="dimmed">
            <strong>{storesLabel}.</strong>{" "}
            {t("recap.playtime.afterConnection")}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
