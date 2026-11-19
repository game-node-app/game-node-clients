import {
  ApiError,
  OwnUserConnectionDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Button, Image } from "@mantine/core";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { CARD_BUTTON_PROPS, CardRow } from "@/components/general/card";
import {
  getConnectionName,
  getServerStoredIcon,
  PreferencesConnectionModal,
  useOwnUserConnectionByType,
} from "@repo/ui";
import type = UserConnectionDto.type;
import { useTranslation } from "@repo/locales";

interface Props {
  type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
  const { t } = useTranslation();
  const userConnection = useOwnUserConnectionByType(type);
  const refetchConnection = userConnection.refetch;
  const [modalOpened, modalUtils] = useDisclosure();

  const isLookupError =
    userConnection.error &&
    !(
      userConnection.error instanceof ApiError &&
      userConnection.error.status === 404
    );

  const requiresReauth =
    userConnection.data?.authStatus ===
    OwnUserConnectionDto.authStatus.REAUTH_REQUIRED;

  const isConnected = userConnection.data != null;
  const isEligible = Boolean(userConnection.data?.isImporterViable);
  const canImport = isConnected && !requiresReauth && isEligible;

  // The raw error is only logged; the user sees a plain message and a retry action.
  useEffect(() => {
    if (isLookupError) console.error(userConnection.error);
  }, [isLookupError, userConnection.error]);

  const description = isConnected ? (
    <>
      <span className="text-neutral-200">
        {userConnection.data!.sourceUsername}
      </span>
      {" · "}
      <span className={requiresReauth ? "text-yellow-500" : "text-teal-400"}>
        {requiresReauth
          ? t("preferences.statuses.reauthRequired")
          : t("preferences.statuses.connected")}
      </span>
    </>
  ) : isLookupError ? (
    <span className="text-red-400">
      {t("mobile.preferences.connectionLoadFailed")}
    </span>
  ) : (
    t("preferences.statuses.notConnected")
  );

  // Primary action sits on the row; secondary ones (reconnect/import) go under the text so a
  // long username never has to compete with two buttons for the same line.
  const trailing = isConnected ? (
    <Button
      {...CARD_BUTTON_PROPS}
      variant="default"
      onClick={modalUtils.open}
      aria-label={t("importer.connection.configure")}
    >
      {t("importer.connection.configure")}
    </Button>
  ) : !isLookupError ? (
    <Button
      {...CARD_BUTTON_PROPS}
      variant="light"
      onClick={modalUtils.open}
      aria-label={t("importer.connection.connect")}
    >
      {t("importer.connection.connect")}
    </Button>
  ) : (
    <Button
      {...CARD_BUTTON_PROPS}
      variant="default"
      loading={userConnection.isFetching}
      onClick={() => {
        refetchConnection().catch(console.error);
      }}
      aria-label={t("actions.retry")}
    >
      {t("actions.retry")}
    </Button>
  );

  const footer =
    requiresReauth || canImport ? (
      <div className="mt-2 flex flex-wrap gap-3">
        {requiresReauth && (
          <Button
            {...CARD_BUTTON_PROPS}
            color="yellow"
            variant="light"
            onClick={modalUtils.open}
            aria-label={t("importer.connection.reconnect")}
          >
            {t("importer.connection.reconnect")}
          </Button>
        )}
        {canImport && (
          <Button
            component={Link}
            to={getTabAwareHref(`/importer/${type.valueOf()}`)}
            {...CARD_BUTTON_PROPS}
            variant="light"
          >
            {t("importer.connection.importGames")}
          </Button>
        )}
      </div>
    ) : undefined;

  return (
    <CardRow
      icon={
        <Image
          alt={t("preferences.labels.connectionIcon")}
          src={getServerStoredIcon(type.valueOf())}
          className="shrink-0 object-contain"
          w={24}
          h={24}
        />
      }
      title={getConnectionName(type)}
      description={description}
      trailing={trailing}
      footer={footer}
    >
      <PreferencesConnectionModal
        type={type}
        opened={modalOpened}
        onClose={modalUtils.close}
        onRedirect={
          Capacitor.isNativePlatform()
            ? async (url) => {
                await Browser.open({ url });
              }
            : undefined
        }
      />
    </CardRow>
  );
};

export default PreferencesConnectionItem;
