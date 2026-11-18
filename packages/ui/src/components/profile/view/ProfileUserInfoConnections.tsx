import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { getConnectionProfileURL } from "#@/components/connections/util/getConnectionProfileURL";
import { useUserConnections } from "#@/components/connections/hooks/useUserConnections";
import { getServerStoredIcon } from "#@/util";
import { Anchor, Group, Image, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

const ProfileUserInfoConnections = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { data, isError } = useUserConnections(userId);

  if (isError)
    return (
      <Text size="sm" c="dimmed">
        {t("profile.messages.fetchFailed")}
      </Text>
    );
  if (!data) return null;
  if (data.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t("profile.overview.noConnections")}
      </Text>
    );
  }

  return (
    <>
      {data.map((connection) => {
        const href = getConnectionProfileURL(connection);
        const key = `connection-${connection.type}`;
        const name = getConnectionName(connection.type);
        const badge = (
          <Group
            gap={6}
            wrap="nowrap"
            className="max-w-full rounded-md bg-paper-6 px-2 py-1.5"
          >
            <Image
              aria-hidden
              src={getServerStoredIcon(connection.type)}
              alt={name}
              w={18}
              h={18}
            />
            <Text component="span" size="sm" fw={600} className="shrink-0">
              {name}
            </Text>
            {connection.sourceUsername && (
              <Text
                component="span"
                size="sm"
                c="dimmed"
                className="min-w-0 break-all"
              >
                {connection.sourceUsername}
              </Text>
            )}
          </Group>
        );

        return href ? (
          <Anchor
            key={key}
            c="inherit"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-full"
          >
            {badge}
          </Anchor>
        ) : (
          <div key={key} className="max-w-full">
            {badge}
          </div>
        );
      })}
    </>
  );
};

export { ProfileUserInfoConnections };
