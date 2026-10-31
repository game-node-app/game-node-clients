import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { authClient } from "./authClient";
import {
  followOAuthDestination,
  getOAuthRequest,
  OAuthDestination,
} from "./oauthRequest";
import { useRouter } from "#@/util/link";
import { MCP_SCOPES } from "#@/components/mcp/connection";

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
            ...(accept ? { scope: request.scope } : {}),
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

  const website = safeHttps(client?.client_uri);
  const metadataDomain = safeHttps(clientId)?.origin;
  const loginPath = `/auth?${oauthQuery}`;

  return (
    <Container
      size="sm"
      py="xl"
      className="oauth-private"
      style={{ width: "100%", minWidth: 0, overflowWrap: "anywhere" }}
    >
      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Title order={1}>{t("mcp.consent.title")}</Title>
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
          ) : (
            <>
              <Text fw={600}>
                {t("mcp.consent.account")}: {session.user.name} (
                {session.user.email})
              </Text>
              {loadError ? (
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
                  <div>
                    <Text size="sm" c="dimmed">
                      {t("mcp.consent.client")}
                    </Text>
                    <Text fw={700}>{client.client_name || clientId}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      {t("mcp.consent.identifier")}
                    </Text>
                    <Text>{clientId}</Text>
                  </div>
                  {metadataDomain && (
                    <Text>
                      {t("mcp.consent.domain")}: {metadataDomain}
                    </Text>
                  )}
                  {client.client_uri && (
                    <div>
                      <Text size="sm" c="dimmed">
                        {t("mcp.consent.website")}
                      </Text>
                      {website ? (
                        <Anchor
                          href={website.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {client.client_uri}
                        </Anchor>
                      ) : (
                        <Text>{client.client_uri}</Text>
                      )}
                    </div>
                  )}
                  <Text size="sm">{t("mcp.consent.disclaimer")}</Text>
                  <Title order={2} size="h3">
                    {t("mcp.consent.permissions")}
                  </Title>
                  <Stack component="ul" pl="md">
                    {request.scope
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((scope, index) => {
                        const category = scope.endsWith(":write")
                          ? "write"
                          : scope === "offline_access"
                            ? "offline"
                            : scope === "openid" || scope === "profile"
                              ? "identity"
                              : scope.endsWith(":read")
                                ? "read"
                                : "unknown";
                        const known = MCP_SCOPES.find((item) => item === scope);
                        const key = known?.replace(":", "_") as
                          | "games_read"
                          | "library_read"
                          | "library_write"
                          | "reviews_write"
                          | "posts_write"
                          | "openid"
                          | "profile"
                          | "offline_access"
                          | undefined;
                        return (
                          <li key={`${scope}-${index}`}>
                            <Badge
                              color={category === "write" ? "orange" : "gray"}
                            >
                              {t(`mcp.${category}`)}
                            </Badge>
                            <Text fw={500}>{scope}</Text>
                            <Text>
                              {key
                                ? t(`mcp.scopeDescriptions.${key}`)
                                : t("mcp.scopeDescriptions.unknown", { scope })}
                            </Text>
                          </li>
                        );
                      })}
                  </Stack>
                  {decisionError && (
                    <Alert
                      ref={errorRef}
                      tabIndex={-1}
                      color="red"
                      role="alert"
                    >
                      {t("mcp.consent.error")}
                    </Alert>
                  )}
                  <Group grow>
                    <Button
                      disabled={submitting}
                      onClick={() => void decide(true)}
                    >
                      {t("mcp.consent.approve")}
                    </Button>
                    <Button
                      variant="default"
                      disabled={submitting}
                      onClick={() => void decide(false)}
                    >
                      {t("mcp.consent.deny")}
                    </Button>
                  </Group>
                  {submitting && (
                    <Text role="status">{t("mcp.consent.submitting")}</Text>
                  )}
                </>
              )}
            </>
          )}
          <Anchor href="/mcp">{t("mcp.consent.guide")}</Anchor>
        </Stack>
      </Paper>
    </Container>
  );
}
