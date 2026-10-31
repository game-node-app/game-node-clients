import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiscordLogo, GoogleLogo, XLogo } from "#@/assets/auth";
import { authClient } from "#@/components/auth/authClient";
import { getAuthErrorKey } from "#@/components/auth/getAuthErrorKey";
import { ActionConfirm } from "#@/components/general/ActionConfirm";
import { createErrorNotification, useRouter } from "#@/util";

const PROVIDERS = [
  { id: "google", Logo: GoogleLogo },
  { id: "discord", Logo: DiscordLogo },
  { id: "twitter", Logo: XLogo },
] as const;
type ProviderId = (typeof PROVIDERS)[number]["id"];

const ACCOUNTS_KEY = ["auth", "accounts"];

interface Props {
  /** Native: pass relative paths so better-auth-capacitor runs linking in the native auth session. */
  relativeCallbacks?: boolean;
}

const SignInMethodsSection = ({ relativeCallbacks = false }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [unlinking, setUnlinking] = useState<ProviderId>();
  const errorCode = router.query.get("error");

  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw error;
      return data;
    },
  });
  const linked = new Set(accountsQuery.data?.map((a) => a.providerId));

  const linkMutation = useMutation({
    mutationFn: async (provider: ProviderId) => {
      // Back to the page the user is on, so the result (and any ?error) shows up here.
      const path = window.location.pathname;
      const url = relativeCallbacks ? path : window.location.origin + path;
      const { error } = await authClient.linkSocial({
        provider,
        callbackURL: url,
        errorCallbackURL: url,
      });
      if (error) throw error;
    },
    onError: createErrorNotification,
  });

  const unlinkMutation = useMutation({
    mutationFn: async (providerId: ProviderId) => {
      const account = accountsQuery.data?.find(
        (a) => a.providerId === providerId,
      );
      const { error } = await authClient.unlinkAccount({
        accountId: account!.id,
      });
      if (error) throw error;
    },
    onError: createErrorNotification,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });

  const errorKey = getAuthErrorKey(errorCode);

  return (
    <Paper withBorder p={"md"} radius={"md"}>
      <Stack>
        <Text fw={600}>{t("auth.methods.title")}</Text>
        <Text size={"sm"} c={"dimmed"}>
          {t("auth.methods.description")}
        </Text>
        {errorCode && (
          <Alert color={"red"} variant={"light"}>
            {t(
              `auth.errors.${errorKey === "default" ? "unable_to_link_account" : errorKey}.body`,
            )}
          </Alert>
        )}
        {PROVIDERS.map(({ id, Logo }) => {
          const isLinked = linked.has(id);
          const isLast = isLinked && linked.size <= 1;
          return (
            <Group key={id} justify={"space-between"} wrap={"nowrap"}>
              <Group gap={"sm"}>
                <Logo />
                <Stack gap={0}>
                  <Text size={"sm"}>
                    {t(`auth.methods.providerNames.${id}`)}
                  </Text>
                  <Text size={"xs"} c={"dimmed"}>
                    {isLinked
                      ? t("auth.methods.linked")
                      : t("auth.methods.notLinked")}
                  </Text>
                </Stack>
              </Group>
              {isLinked ? (
                <Tooltip
                  label={t("auth.methods.lastMethod")}
                  disabled={!isLast}
                >
                  <span>
                    <Button
                      variant={"subtle"}
                      color={"red"}
                      size={"xs"}
                      disabled={isLast || unlinkMutation.isPending}
                      onClick={() => setUnlinking(id)}
                    >
                      {t("auth.methods.unlink")}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  variant={"outline"}
                  color={"brand"}
                  size={"xs"}
                  loading={
                    linkMutation.isPending && linkMutation.variables === id
                  }
                  disabled={accountsQuery.isPending}
                  onClick={() => linkMutation.mutate(id)}
                >
                  {t("auth.methods.link")}
                </Button>
              )}
            </Group>
          );
        })}
      </Stack>
      <ActionConfirm
        opened={unlinking != undefined}
        onClose={() => setUnlinking(undefined)}
        title={t("auth.methods.unlinkTitle", {
          provider: unlinking && t(`auth.methods.providerNames.${unlinking}`),
        })}
        message={t("auth.methods.unlinkConfirm", {
          provider: unlinking && t(`auth.methods.providerNames.${unlinking}`),
        })}
        onConfirm={() => unlinking && unlinkMutation.mutate(unlinking)}
      />
    </Paper>
  );
};

export { SignInMethodsSection };
