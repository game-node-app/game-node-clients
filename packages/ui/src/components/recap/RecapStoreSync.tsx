import { useOwnUserConnections } from "#@/components/connections/hooks/useOwnUserConnections";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { useFormatLocale } from "#@/components/events/util/format";
import { Group, Stack, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import {
  OwnUserConnectionDto,
  type UserConnectionDto,
} from "@repo/wrapper/server";
import { Fragment } from "react";

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
    <Stack
      component="section"
      gap={4}
      className="w-full"
      aria-label={t("recap.playtime.syncTitle")}
    >
      <Group gap={6} wrap="nowrap" align="flex-start" c="dimmed">
        <IconRefresh size={14} className="mt-[3px] shrink-0" aria-hidden />
        <Text size="xs" c="dimmed" component="div" className="min-w-0">
          <span className="font-medium">{t("recap.playtime.syncTitle")}:</span>{" "}
          {connections.map(({ type, lastSyncedAt }, index) => {
            const date = lastSyncedAt ? new Date(lastSyncedAt) : null;

            return (
              <Fragment key={type}>
                {index > 0 && " "}
                <span className="inline-block max-w-full align-top">
                  {index > 0 && "·\u00a0"}
                  <span className="text-foreground/80">
                    {getConnectionName(type as UserConnectionDto.type)}
                  </span>{" "}
                  {date && Number.isFinite(date.getTime()) ? (
                    <time dateTime={date.toISOString()}>
                      {dateFormat.format(date)}
                    </time>
                  ) : (
                    t("recap.playtime.noSync")
                  )}
                </span>
              </Fragment>
            );
          })}
        </Text>
      </Group>
      <Text size="xs" c="dimmed" pl={20} className="opacity-80">
        {t("recap.playtime.syncDelay")}
        {stores.length > 0 && (
          <>
            {" "}
            <strong>{storesLabel}.</strong>{" "}
            {t("recap.playtime.afterConnection")}
          </>
        )}
      </Text>
    </Stack>
  );
}
