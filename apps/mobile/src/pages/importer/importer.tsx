import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Container, Group, Space, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ImporterItem,
  useOwnUserConnections,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

const ImporterPage = () => {
  const { data, isLoading, isError, error } = useOwnUserConnections();

  const importerUsableConnections = data?.filter(
    (connection) => connection.isImporterViable && connection.isImporterEnabled,
  );

  const isImportingAvailable =
    importerUsableConnections != undefined &&
    importerUsableConnections.length > 0;

  return (
    <AppPage>
      <Stack w={"100%"} justify={"center"} align={"center"} mb={"lg"}>
        <Stack className={"w-full h-full items-center p-2 pb-8"}>
          <Text className={"text-center"}>
            The importer system helps you bring games from other platforms to
            GameNode.
          </Text>
          <Space h={"2rem"} />
          {isLoading && <CenteredLoading className={"mt-8"} />}
          {isError && <CenteredErrorMessage message={error.message} />}
          {!isLoading && !isError && !isImportingAvailable && (
            <Text c={"red"}>
              It seems like you don&apos;t have any connection set up for
              importing.{" "}
              <Link to={getTabAwareHref("/preferences/connections")}>
                Click here
              </Link>{" "}
              to set one up.
            </Text>
          )}
          <Group className={"w-full gap-5 justify-center"}>
            {importerUsableConnections?.map((connection) => {
              return (
                <ImporterItem key={connection.id} connection={connection} />
              );
            })}
          </Group>
        </Stack>
      </Stack>
    </AppPage>
  );
};

export default ImporterPage;
