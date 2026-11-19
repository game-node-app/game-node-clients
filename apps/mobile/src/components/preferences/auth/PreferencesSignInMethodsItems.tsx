import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import { Alert, Button } from "@mantine/core";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "@repo/locales";
import { ActionConfirm, PROVIDERS, useSignInMethods } from "@repo/ui";

const PreferencesSignInMethodsItems = () => {
  const { t } = useTranslation();
  const {
    linked,
    errorCode,
    errorKey,
    unlinking,
    setUnlinking,
    linkMutation,
    unlinkMutation,
    isLoadingAccounts,
  } = useSignInMethods(Capacitor.isNativePlatform());

  return (
    <CardSection title={t("auth.methods.title")}>
      {errorCode && (
        <Alert color={"red"} variant={"light"} className={"m-3"}>
          {t(
            `auth.errors.${errorKey === "default" ? "unable_to_link_account" : errorKey}.body`,
          )}
        </Alert>
      )}
      {PROVIDERS.map(({ id, Logo }) => {
        const isLinked = linked.has(id);
        const isLast = isLinked && linked.size <= 1;
        return (
          <CardRow
            key={id}
            icon={<Logo />}
            title={t(`auth.methods.providerNames.${id}`)}
            description={
              isLinked ? t("auth.methods.linked") : t("auth.methods.notLinked")
            }
            trailing={
              isLinked ? (
                <Button
                  variant={"subtle"}
                  color={"red"}
                  size={"xs"}
                  disabled={isLast || unlinkMutation.isPending}
                  onClick={() => setUnlinking(id)}
                >
                  {t("auth.methods.unlink")}
                </Button>
              ) : (
                <Button
                  variant={"light"}
                  size={"xs"}
                  loading={
                    linkMutation.isPending && linkMutation.variables === id
                  }
                  disabled={isLoadingAccounts}
                  onClick={() => linkMutation.mutate(id)}
                >
                  {t("auth.methods.link")}
                </Button>
              )
            }
          />
        );
      })}
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
    </CardSection>
  );
};

export default PreferencesSignInMethodsItems;
