import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Alert, Button, Group } from "@mantine/core";
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
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("auth.methods.title")}</IonLabel>
      </IonItemDivider>
      {errorCode && (
        <Alert color={"red"} variant={"light"} className={"m-2"}>
          {t(
            `auth.errors.${errorKey === "default" ? "unable_to_link_account" : errorKey}.body`,
          )}
        </Alert>
      )}
      {PROVIDERS.map(({ id, Logo }) => {
        const isLinked = linked.has(id);
        const isLast = isLinked && linked.size <= 1;
        return (
          <IonItem key={id}>
            <Group className={"gap-2 w-full"} wrap={"nowrap"}>
              <Logo />
              <IonLabel>
                <h3>{t(`auth.methods.providerNames.${id}`)}</h3>
                <p>
                  {isLinked
                    ? t("auth.methods.linked")
                    : t("auth.methods.notLinked")}
                </p>
              </IonLabel>
            </Group>
            {isLinked ? (
              <Button
                slot={"end"}
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
                slot={"end"}
                variant={"outline"}
                color={"brand"}
                size={"xs"}
                loading={
                  linkMutation.isPending && linkMutation.variables === id
                }
                disabled={isLoadingAccounts}
                onClick={() => linkMutation.mutate(id)}
              >
                {t("auth.methods.link")}
              </Button>
            )}
          </IonItem>
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
    </IonItemGroup>
  );
};

export default PreferencesSignInMethodsItems;
