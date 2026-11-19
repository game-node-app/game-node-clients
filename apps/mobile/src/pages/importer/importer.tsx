import { AppPage } from "@/components/general/AppPage";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ImporterPlatform,
  useOwnUserConnections,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const ImporterPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useOwnUserConnections();

  const importerUsableConnections = data?.filter(
    (connection) => connection.isImporterViable,
  );

  const isImportingAvailable =
    importerUsableConnections != undefined &&
    importerUsableConnections.length > 0;

  return (
    <AppPage title={t("importer.title")} withSearch={false}>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.invalidateQueries({
            queryKey: ["connections", "own"],
          });
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Stack w={"100%"} mb={"lg"}>
        <Stack className={"w-full h-full items-center gap-4 p-2 pb-8"}>
          <Text size="sm" c="dimmed" className={"w-full max-w-xl"}>
            {t("mobile.importer.description")}
          </Text>
          {isLoading && <CenteredLoading className={"mt-8"} />}
          {isError && <CenteredErrorMessage message={error.message} />}
          {!isLoading && !isError && !isImportingAvailable && (
            <Text c={"red"}>
              {t("mobile.importer.noConnections")}{" "}
              <Link to={getTabAwareHref("/preferences/connections")}>
                {t("mobile.importer.clickHere")}
              </Link>{" "}
              {t("mobile.importer.setUpOne")}
            </Text>
          )}
          <Stack className={"w-full items-center gap-3"}>
            {importerUsableConnections?.map((connection) => {
              return (
                <ImporterPlatform key={connection.id} connection={connection} />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </AppPage>
  );
};

export default ImporterPage;
