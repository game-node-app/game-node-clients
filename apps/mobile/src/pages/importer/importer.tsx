import { AppPage } from "@/components/general/AppPage";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ImporterPlatform,
  useAvailableConnections,
  useOwnUserConnections,
} from "@repo/ui";
import { OwnUserConnectionDto, UserConnectionDto } from "@repo/wrapper/server";
import { useQueryClient } from "@tanstack/react-query";

const ImporterPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const availableConnections = useAvailableConnections();
  const ownConnections = useOwnUserConnections();

  const importerConnections =
    availableConnections.data?.filter(
      (connection) => connection.isImporterViable,
    ) ?? [];

  const ownConnectionsByType = new Map<string, OwnUserConnectionDto>(
    (ownConnections.data ?? []).map(
      (connection): [string, OwnUserConnectionDto] => [
        connection.type.valueOf(),
        connection,
      ],
    ),
  );

  const isLoading = availableConnections.isLoading || ownConnections.isLoading;
  const isError = availableConnections.isError || ownConnections.isError;
  const error = availableConnections.error ?? ownConnections.error;

  return (
    <AppPage title={t("importer.title")} withSearch={false}>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.invalidateQueries({
            queryKey: ["connections"],
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
          {isError && error != undefined && (
            <CenteredErrorMessage message={error.message} />
          )}
          {!isLoading && !isError && importerConnections.length === 0 && (
            <Text c={"dimmed"}>
              {t("importer.messages.noPlatformsAvailable")}
            </Text>
          )}
          <Stack className={"w-full items-center gap-3"}>
            {importerConnections.map((connection) => {
              return (
                <ImporterPlatform
                  key={connection.type}
                  type={connection.type as unknown as UserConnectionDto.type}
                  name={connection.name}
                  iconName={connection.iconName}
                  connection={ownConnectionsByType.get(
                    connection.type.valueOf(),
                  )}
                />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </AppPage>
  );
};

export default ImporterPage;
