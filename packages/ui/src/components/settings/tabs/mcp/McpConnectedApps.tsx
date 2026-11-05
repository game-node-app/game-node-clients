import { Group, Skeleton, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import {
  SettingsButton,
  SettingsCard,
  SettingsComingSoonBadge,
  SettingsPill,
  SettingsSection,
} from "#@/components/settings/common";
import {
  OAuthConnectedApp,
  useOAuthConsents,
} from "#@/components/settings/hooks/useOAuthConsents";
import { useRevokeOAuthConsent } from "#@/components/settings/hooks/useRevokeOAuthConsent";
import { McpAppTile } from "#@/components/settings/tabs/mcp/McpAppTile";
import { McpRevokeDialog } from "#@/components/settings/tabs/mcp/McpRevokeDialog";
import {
  getMcpPermissionKey,
  isMcpPermissionScope,
} from "#@/components/settings/tabs/mcp/mcpPermissions";

/**
 * `/oauth2/delete-consent` only deletes the consent row: the app keeps its
 * refresh token and can go on minting access tokens. Until the server revokes
 * the client's refresh tokens too (as `AuthService.lockOut` does for bans),
 * "Revoke access" stays disabled instead of promising something it can't do.
 */
const MCP_REVOKE_AVAILABLE = false;

function safeHttps(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

/**
 * Same rule as the consent screen: a client id that is an HTTPS metadata
 * document URL (CIMD) proves the domain; otherwise fall back to `client_uri`.
 */
function getAppIdentity(app: OAuthConnectedApp) {
  const verifiedDomain = safeHttps(app.clientId)?.host ?? null;
  const domain = verifiedDomain ?? safeHttps(app.client?.client_uri)?.host;
  return {
    name: app.client?.client_name || domain || app.clientId,
    domain: domain ?? null,
    verified: !!verifiedDomain,
  };
}

function ConnectedAppRow({
  app,
  onRevoke,
}: {
  app: OAuthConnectedApp;
  onRevoke: () => void;
}) {
  const { t } = useTranslation();
  const { name, domain, verified } = getAppIdentity(app);
  const scopes = app.scopes
    .filter(isMcpPermissionScope)
    .map((scope) =>
      t(`settings.mcp.scopes.${getMcpPermissionKey(scope)}.short`),
    );
  const summary = scopes.join(", ");
  const details = [
    summary && summary.charAt(0).toUpperCase() + summary.slice(1),
    app.createdAt &&
      t("settings.mcp.apps.connectedAt", {
        date: dayjs(app.createdAt).format(t("settings.mcp.apps.dateFormat")),
      }),
  ].filter(Boolean);

  return (
    <Group wrap={"nowrap"} gap={16} className={"w-full px-5 py-4"}>
      <McpAppTile name={name} />
      <Stack gap={4} className={"min-w-0 flex-1"}>
        <Group gap={8} wrap={"wrap"} className={"min-w-0"}>
          <Text
            fz={14}
            fw={600}
            c={"white"}
            lh={"normal"}
            className={"min-w-0 break-words"}
          >
            {name}
          </Text>
          {(domain || verified) && (
            <Group gap={6} wrap={"wrap"}>
              {domain && domain !== name && (
                <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
                  {domain}
                </Text>
              )}
              {verified && (
                <SettingsPill tone={"success"}>
                  {t("mcp.consent.verified")}
                </SettingsPill>
              )}
            </Group>
          )}
        </Group>
        {details.length > 0 && (
          <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
            {details.join(" · ")}
          </Text>
        )}
      </Stack>
      <Stack gap={6} align={"flex-end"} className={"shrink-0"}>
        <SettingsButton
          variant={"dangerOutline"}
          onClick={onRevoke}
          disabled={!MCP_REVOKE_AVAILABLE}
        >
          {t("settings.mcp.apps.revoke")}
        </SettingsButton>
        {!MCP_REVOKE_AVAILABLE && <SettingsComingSoonBadge />}
      </Stack>
    </Group>
  );
}

function ConnectedAppSkeleton() {
  return (
    <Group wrap={"nowrap"} gap={16} className={"w-full px-5 py-4"}>
      <Skeleton width={36} height={36} radius={10} />
      <Stack gap={8} className={"flex-1"}>
        <Skeleton width={"30%"} height={14} radius={4} />
        <Skeleton width={"60%"} height={12} radius={4} />
      </Stack>
      <Skeleton width={112} height={31} radius={8} />
    </Group>
  );
}

/** "Connected apps": OAuth consents of the signed-in user (revoking is gated, see `MCP_REVOKE_AVAILABLE`). */
export function McpConnectedApps() {
  const { t } = useTranslation();
  const consentsQuery = useOAuthConsents();
  const revokeMutation = useRevokeOAuthConsent();
  /** Kept after closing so the dialog keeps its text during the exit transition. */
  const [revoking, setRevoking] = useState<OAuthConnectedApp | null>(null);
  const [dialogOpened, setDialogOpened] = useState(false);
  const revokingName = revoking ? getAppIdentity(revoking).name : "";

  const confirmRevoke = () => {
    if (!revoking) return;
    const app = revokingName;
    revokeMutation.mutate(revoking.id, {
      onSuccess: () => {
        setDialogOpened(false);
        notifications.show({
          color: "green",
          icon: <IconCheck size={16} />,
          message: t("settings.mcp.apps.revoked", { app }),
        });
      },
    });
  };

  const apps = consentsQuery.data ?? [];

  return (
    <SettingsSection title={t("settings.mcp.apps.title")}>
      {consentsQuery.isError ? (
        <SettingsCard>
          <Group
            wrap={"nowrap"}
            gap={16}
            role={"alert"}
            className={"w-full px-5 py-4"}
          >
            <Text fz={13} lh={"18px"} className={"flex-1 text-[#ff6369]"}>
              {t("settings.mcp.apps.loadError")}
            </Text>
            <SettingsButton
              variant={"secondary"}
              onClick={() => consentsQuery.invalidate()}
              loading={consentsQuery.isFetching}
            >
              {t("mcp.consent.retry")}
            </SettingsButton>
          </Group>
        </SettingsCard>
      ) : consentsQuery.isPending ? (
        <SettingsCard aria-busy>
          <ConnectedAppSkeleton />
          <ConnectedAppSkeleton />
        </SettingsCard>
      ) : apps.length === 0 ? (
        <SettingsCard>
          <Stack gap={4} className={"w-full px-5 py-4"}>
            <Text fz={14} fw={600} c={"white"} lh={"normal"}>
              {t("settings.mcp.apps.empty")}
            </Text>
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {t("settings.mcp.apps.emptyHint")}
            </Text>
          </Stack>
        </SettingsCard>
      ) : (
        <SettingsCard>
          {apps.map((app) => (
            <ConnectedAppRow
              key={app.id}
              app={app}
              onRevoke={() => {
                setRevoking(app);
                setDialogOpened(true);
              }}
            />
          ))}
        </SettingsCard>
      )}
      <McpRevokeDialog
        opened={dialogOpened}
        appName={revokingName}
        loading={revokeMutation.isPending}
        onClose={() => setDialogOpened(false)}
        onConfirm={confirmRevoke}
      />
    </SettingsSection>
  );
}
