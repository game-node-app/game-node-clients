import { Box, Group, Image, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  FindAvailableConnectionsResponseDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { IconChevronRight, IconSparkles } from "@tabler/icons-react";
import { useAvailableConnections } from "#@/components/connections/hooks/useAvailableConnections";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { usePreferencesConnectionStatus } from "#@/components/preferences/handlers/connections/PreferencesConnectionItem";
import { PreferencesConnectionModal } from "#@/components/preferences/handlers/connections/PreferencesConnectionModal";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsPill } from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { getErrorMessage, getServerStoredIcon, Link } from "#@/util";

type AvailableConnection = FindAvailableConnectionsResponseDto;

/**
 * Settings-styled version of `PreferencesConnectionItem`: same status logic
 * (`usePreferencesConnectionStatus`) and setup modal, drawn as a `SettingsRow`.
 */
function SettingsConnectionRow({
  connection,
}: {
  connection: AvailableConnection;
}) {
  const { t } = useTranslation();
  const type = connection.type;
  const [modalOpened, modalUtils] = useDisclosure();
  const {
    userConnection,
    isLookupError,
    requiresReauth,
    isConnected,
    isEligible,
  } = usePreferencesConnectionStatus(type);

  const description = isLookupError ? (
    <Text component={"span"} fz={13} c={"inherit"} className={"text-[#ff6369]"}>
      {getErrorMessage(userConnection.error)}
    </Text>
  ) : requiresReauth ? (
    t("preferences.messages.reauthRequired")
  ) : isConnected ? (
    t("importer.connection.connectedAs", {
      username: userConnection.data!.sourceUsername,
    })
  ) : (
    t("preferences.statuses.notConnected")
  );

  return (
    <>
      <PreferencesConnectionModal
        type={type}
        opened={modalOpened}
        onClose={modalUtils.close}
      />
      <SettingsRow
        leftSection={
          <Box
            className={
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#222]"
            }
          >
            <Image
              alt={t("preferences.labels.connectionIcon")}
              src={getServerStoredIcon(type.valueOf())}
              w={20}
              h={20}
              fit={"contain"}
            />
          </Box>
        }
        title={
          // The server can list types newer than this client's wrapper (getConnectionName would throw).
          Object.values<string>(UserConnectionDto.type).includes(type)
            ? getConnectionName(type as unknown as UserConnectionDto.type)
            : connection.name
        }
        titleBadges={
          requiresReauth ? (
            <SettingsPill tone={"danger"} withDot>
              {t("preferences.statuses.reauthRequired")}
            </SettingsPill>
          ) : isConnected ? (
            <SettingsPill tone={"success"} withDot>
              {t("preferences.statuses.connected")}
            </SettingsPill>
          ) : undefined
        }
        description={description}
        rightSection={
          <Group gap={8} wrap={"nowrap"}>
            {isConnected && !requiresReauth && isEligible && (
              <SettingsButton
                component={Link}
                href={`/importer/${type.valueOf()}`}
                variant={"ghost"}
              >
                {t("importer.connection.importGames")}
              </SettingsButton>
            )}
            {requiresReauth ? (
              <SettingsButton variant={"primary"} onClick={modalUtils.open}>
                {t("importer.connection.reconnect")}
              </SettingsButton>
            ) : isConnected ? (
              <SettingsButton variant={"secondary"} onClick={modalUtils.open}>
                {t("importer.connection.configure")}
              </SettingsButton>
            ) : !isLookupError ? (
              <SettingsButton variant={"primary"} onClick={modalUtils.open}>
                {t("importer.connection.connect")}
              </SettingsButton>
            ) : null}
          </Group>
        }
      />
    </>
  );
}

export function SettingsConnectionsTab() {
  const { t } = useTranslation();
  const { select } = useSettingsModalState();
  const { data, isLoading, isError } = useAvailableConnections();

  return (
    <>
      <SettingsSection
        title={t("settings.connections.platforms.title")}
        description={t("settings.connections.platforms.description")}
      >
        <SettingsCard>
          {isLoading && <CenteredLoading className={"py-8"} />}
          {isError && (
            <Text fz={13} className={"px-5 py-6 text-center text-[#ff6369]"}>
              {t("preferences.messages.availableConnectionsError")}
            </Text>
          )}
          {data?.length === 0 && (
            <Text fz={13} className={"px-5 py-6 text-center text-[#adadad]"}>
              {t("settings.connections.platforms.empty")}
            </Text>
          )}
          {data?.map((connection) => (
            <SettingsConnectionRow
              key={connection.type.valueOf()}
              connection={connection}
            />
          ))}
        </SettingsCard>
      </SettingsSection>
      <SettingsSection
        title={t("settings.connections.mcp.title")}
        description={t("settings.connections.mcp.description")}
      >
        <SettingsCard>
          <SettingsRow
            Icon={IconSparkles}
            title={t("mcp.title")}
            description={t("settings.connections.mcp.rowDescription")}
            rightSection={
              <SettingsButton
                variant={"secondary"}
                rightSection={<IconChevronRight size={14} />}
                classNames={{ section: "ms-1.5" }}
                onClick={() => select("mcp")}
              >
                {t("settings.connections.mcp.action")}
              </SettingsButton>
            }
          />
        </SettingsCard>
      </SettingsSection>
    </>
  );
}
