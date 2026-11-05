import { Box, Group, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconBrandDiscord,
  IconBrandGoogle,
  IconBrandX,
  IconLock,
  IconMail,
  IconProps,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { authClient } from "#@/components/auth/authClient";
import { ActionConfirm } from "#@/components/general/ActionConfirm";
import {
  PROVIDERS,
  ProviderId,
  useSignInMethods,
} from "#@/components/preferences/handlers/account/SignInMethodsSection";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";

const PROVIDER_ICONS: Record<ProviderId, ComponentType<IconProps>> = {
  google: IconBrandGoogle,
  discord: IconBrandDiscord,
  twitter: IconBrandX,
};

/**
 * Social sign-in methods (link/unlink through `useSignInMethods`, shared with
 * mobile) plus the email-code method, which has no backend yet.
 */
export function SettingsSignInMethodsCard() {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const email = session?.user.email;
  const {
    linked,
    errorCode,
    errorKey,
    unlinking,
    setUnlinking,
    linkMutation,
    unlinkMutation,
    isLoadingAccounts,
  } = useSignInMethods();

  const unlinkingName =
    unlinking && t(`auth.methods.providerNames.${unlinking}`);

  return (
    <>
      {errorCode && (
        <Box
          role={"alert"}
          className={
            "rounded-lg border border-solid border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.12)] px-4 py-3"
          }
        >
          <Text fz={13} lh={"18px"} className={"text-[#ff6369]"}>
            {t(
              `auth.errors.${errorKey === "default" ? "unable_to_link_account" : errorKey}.body`,
            )}
          </Text>
        </Box>
      )}
      <SettingsCard>
        <SettingsRow
          disabled
          Icon={IconMail}
          title={t("settings.privacy.signIn.emailCode.title")}
          titleBadges={<SettingsComingSoonBadge />}
          description={
            email
              ? t("settings.privacy.signIn.emailCode.descriptionWithEmail", {
                  email,
                })
              : t("settings.privacy.signIn.emailCode.description")
          }
          rightSection={
            <SettingsButton variant={"secondary"} disabled>
              {t("settings.privacy.signIn.changeEmail")}
            </SettingsButton>
          }
        />
        {PROVIDERS.map(({ id }) => {
          const isLinked = linked.has(id);
          const isLast = isLinked && linked.size <= 1;
          return (
            <SettingsRow
              key={id}
              Icon={PROVIDER_ICONS[id]}
              title={t(`auth.methods.providerNames.${id}`)}
              description={
                isLinked
                  ? t("auth.methods.linked")
                  : t("auth.methods.notLinked")
              }
              rightSection={
                isLinked ? (
                  <Tooltip
                    label={t("auth.methods.lastMethod")}
                    disabled={!isLast}
                  >
                    <span>
                      <SettingsButton
                        variant={"secondary"}
                        disabled={isLast || unlinkMutation.isPending}
                        onClick={() => setUnlinking(id)}
                      >
                        {t("auth.methods.unlink")}
                      </SettingsButton>
                    </span>
                  </Tooltip>
                ) : (
                  <SettingsButton
                    variant={"secondary"}
                    loading={
                      linkMutation.isPending && linkMutation.variables === id
                    }
                    disabled={isLoadingAccounts}
                    onClick={() => linkMutation.mutate(id)}
                  >
                    {t("auth.methods.link")}
                  </SettingsButton>
                )
              }
            />
          );
        })}
        <Group gap={8} wrap={"nowrap"} className={"bg-[#0b0b0b] px-5 py-3"}>
          <IconLock size={14} className={"shrink-0 text-[#7a7a7a]"} />
          <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
            {t("settings.privacy.signIn.note")}
          </Text>
        </Group>
      </SettingsCard>
      <ActionConfirm
        opened={unlinking != undefined}
        onClose={() => setUnlinking(undefined)}
        title={t("auth.methods.unlinkTitle", { provider: unlinkingName })}
        message={t("auth.methods.unlinkConfirm", { provider: unlinkingName })}
        onConfirm={() => unlinking && unlinkMutation.mutate(unlinking)}
      />
    </>
  );
}
