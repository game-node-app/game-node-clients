import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconAlertTriangle, IconPlugConnected } from "@tabler/icons-react";
import { authClient } from "./authClient";
import {
  followOAuthDestination,
  getOAuthRequest,
  OAuthDestination,
} from "./oauthRequest";
import { useRouter } from "#@/util/link";
import { MCP_SCOPES } from "#@/components/mcp/connection";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";

interface PublicClient {
  client_name?: string;
  client_uri?: string;
}

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

export function OAuthConsentScreen() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const request = getOAuthRequest(query);
  const oauthQuery = request?.oauthQuery;
  const clientId = request?.clientId;
  const { data: session, isPending } = authClient.useSession();
  const [client, setClient] = useState<PublicClient | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [decisionError, setDecisionError] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [retry, setRetry] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const busy = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !session || isPending) return;
    let active = true;
    setClient(null);
    setLoadError(false);
    void authClient
      .$fetch<PublicClient>("/oauth2/public-client", {
        query: { client_id: clientId },
      })
      .then(({ data, error }) => {
        if (!active) return;
        if (error?.status === 401) setNeedsLogin(true);
        if (error || !data) setLoadError(true);
        else setClient(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [clientId, session, isPending, retry]);

  useEffect(() => {
    if (loadError || decisionError) errorRef.current?.focus();
  }, [loadError, decisionError]);

  const decide = async (accept: boolean) => {
    if (!request || !client || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setDecisionError(false);
    try {
      const { data, error } = await authClient.$fetch<OAuthDestination>(
        "/oauth2/consent",
        {
          method: "POST",
          body: {
            accept,
            ...(accept ? { scope: scopes.filter(isChecked).join(" ") } : {}),
            oauth_query: request.oauthQuery,
          },
        },
      );
      if (error?.status === 401) setNeedsLogin(true);
      if (error) throw new Error("Consent rejected");
      followOAuthDestination(data);
    } catch {
      setDecisionError(true);
      setSubmitting(false);
      busy.current = false;
    }
  };

  const metadataDomain = safeHttps(clientId)?.host;
  const domain =
    metadataDomain ?? safeHttps(client?.client_uri)?.host ?? clientId;
  const name = client?.client_name || clientId || "";
  const loginPath = `/auth?${oauthQuery}`;
  const scopes = [...new Set(request?.scope.split(/\s+/).filter(Boolean))];
  const isChecked = (scope: string) => checked[scope] ?? true;
  const groups = [
    ["read", scopes.filter((scope) => scope.endsWith(":read"))],
    ["write", scopes.filter((scope) => scope.endsWith(":write"))],
    ["other", scopes.filter((scope) => !/:(read|write)$/.test(scope))],
  ] as const;

  const switchAccount = async () => {
    await authClient.signOut();
    window.location.assign(loginPath);
  };

  return (
    <Stack
      className="oauth-private"
      align="center"
      gap={40}
      px={16}
      py={{ base: 12, sm: 40 }}
      style={{ minWidth: 0, overflowWrap: "anywhere" }}
    >
      <Group w="100%" maw={1360}>
        <GameNodeLogo style={{ height: 28, width: "auto" }} />
      </Group>
      <Paper
        withBorder
        radius={16}
        w="100%"
        maw={480}
        px={{ base: 20, sm: 28 }}
        pt={{ base: 22, sm: 28 }}
        pb={24}
      >
        <Stack gap={20}>
          {!request ? (
            <Alert color="red" role="alert">
              {t("mcp.consent.invalid")}
            </Alert>
          ) : isPending ? (
            <Text role="status">{t("mcp.consent.loading")}</Text>
          ) : !session || needsLogin ? (
            <Button component="a" href={loginPath}>
              {t("mcp.consent.login")}
            </Button>
          ) : loadError ? (
            <>
              <Alert ref={errorRef} tabIndex={-1} color="red" role="alert">
                {t("mcp.consent.metadataError")}
              </Alert>
              <Button onClick={() => setRetry((value) => value + 1)}>
                {t("mcp.consent.retry")}
              </Button>
            </>
          ) : !client ? (
            <Group role="status">
              <Loader size="sm" />
              <Text>{t("mcp.consent.loading")}</Text>
            </Group>
          ) : (
            <>
              <Group gap={10} aria-hidden>
                <Center w={44} h={44} bg="dark.6" style={{ borderRadius: 10 }}>
                  <Text fz={18} fw={600}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </Center>
                <IconPlugConnected
                  size={16}
                  color="var(--mantine-color-dimmed)"
                />
                <Center w={44} h={44} bg="brand" style={{ borderRadius: 10 }}>
                  <Text fz={20} fw={700} c="white">
                    G
                  </Text>
                </Center>
              </Group>
              <Stack gap={8}>
                <Title order={1} fz={32} fw={500} lh="normal">
                  {t("mcp.consent.title", { client: name })}
                </Title>
                <Group gap={8}>
                  <Text ff="monospace" fz={12} c="dimmed">
                    {domain}
                  </Text>
                  <Badge
                    variant="light"
                    color={metadataDomain ? "green" : "yellow"}
                    radius="xl"
                    tt="none"
                    fw={500}
                  >
                    {t(
                      metadataDomain
                        ? "mcp.consent.verified"
                        : "mcp.consent.unverified",
                    )}
                  </Badge>
                </Group>
              </Stack>
              {!metadataDomain && (
                <Alert
                  variant="light"
                  color="yellow"
                  icon={<IconAlertTriangle size={16} />}
                  style={{ border: "1px solid var(--mantine-color-yellow-6)" }}
                >
                  <Text fz={13} lh="18px" c="dimmed">
                    {t("mcp.consent.unverifiedWarning")}
                  </Text>
                </Alert>
              )}
              <Group
                gap={10}
                px={12}
                py={10}
                bg="dark.8"
                wrap="nowrap"
                style={{ borderRadius: 8 }}
              >
                <UserAvatar userId={session.user.id} size={28} />
                <Text fz={13} lh="18px" c="dimmed" flex={1}>
                  {t("mcp.consent.signedInAs", { name: session.user.name })} (
                  {session.user.email})
                </Text>
                <Anchor
                  component="button"
                  type="button"
                  fz={13}
                  onClick={() => void switchAccount()}
                >
                  {t("mcp.consent.switchAccount")}
                </Anchor>
              </Group>
              <Stack gap={14}>
                <Text fz={14} fw={600}>
                  {t("mcp.consent.choose", { client: name })}
                </Text>
                {groups.map(
                  ([group, items]) =>
                    items.length > 0 && (
                      <div key={group}>
                        <Text
                          fz={11}
                          fw={600}
                          c="dimmed"
                          tt="uppercase"
                          lts={0.6}
                        >
                          {t(`mcp.consent.groups.${group}`)}
                        </Text>
                        <Stack
                          component="ul"
                          gap={0}
                          p={0}
                          m={0}
                          style={{ listStyle: "none" }}
                        >
                          {items.map((scope) => {
                            const known = MCP_SCOPES.find(
                              (item) => item === scope,
                            );
                            return (
                              <Group
                                component="li"
                                key={scope}
                                py={10}
                                gap={12}
                                wrap="nowrap"
                              >
                                <Checkbox
                                  size="xs"
                                  radius={4}
                                  checked={isChecked(scope)}
                                  onChange={(event) =>
                                    setChecked({
                                      ...checked,
                                      [scope]: event.currentTarget.checked,
                                    })
                                  }
                                  label={
                                    known
                                      ? t(
                                          `mcp.scopeDescriptions.${known.replace(":", "_") as "games_read"}`,
                                        )
                                      : t("mcp.scopeDescriptions.unknown", {
                                          scope,
                                        })
                                  }
                                  styles={{ label: { fontSize: 14 } }}
                                  style={{ flex: 1 }}
                                />
                                <Text ff="monospace" fz={11} c="dimmed">
                                  {scope}
                                </Text>
                              </Group>
                            );
                          })}
                        </Stack>
                      </div>
                    ),
                )}
              </Stack>
              <Text fz={13} lh="18px" c="dimmed">
                {t("mcp.consent.disclaimer")}
              </Text>
              {decisionError && (
                <Alert ref={errorRef} tabIndex={-1} color="red" role="alert">
                  {t("mcp.consent.error")}
                </Alert>
              )}
              <Group grow gap={10}>
                <Button
                  variant="default"
                  radius={8}
                  disabled={submitting}
                  onClick={() => void decide(false)}
                >
                  {t("mcp.consent.deny")}
                </Button>
                <Button
                  radius={8}
                  disabled={submitting || !scopes.some(isChecked)}
                  onClick={() => void decide(true)}
                >
                  {t("mcp.consent.approve")}
                </Button>
              </Group>
              {submitting && (
                <Text role="status">{t("mcp.consent.submitting")}</Text>
              )}
            </>
          )}
          <Anchor href="/mcp" fz={12} c="dimmed" ta="center">
            {t("mcp.consent.guide")}
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
}
