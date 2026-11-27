import { Group, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ImporterPlatform,
  useAvailableConnections,
  useOwnUserConnections,
} from "@repo/ui";
import {
  ConnectionsService,
  OwnUserConnectionDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { NextPageContext } from "next";
import { SessionAuth } from "@repo/ui";

export const getServerSideProps = async (_context: NextPageContext) => {
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["connections", "own"],
      queryFn: () => ConnectionsService.connectionsControllerFindOwnV1(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["connections", "available"],
      queryFn: () =>
        ConnectionsService.connectionsControllerFindAvailableConnectionsV1(),
    }),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const Index = () => {
  const { t } = useTranslation();
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
    <SessionAuth>
      <Stack w={"100%"} justify={"center"} align={"center"}>
        <Paper className={"w-full p-2 pb-8"}>
          <Stack className={"w-full h-full items-center"}>
            <Title size={"h4"}>
              {t("importer.titlePrimary")}{" "}
              <span className={"text-brand"}>
                {t("importer.titleAccent")}
              </span>
            </Title>

            <Text>{t("importer.messages.overview")}</Text>
            <Space h={"2rem"} />
            {isLoading && <CenteredLoading className={"mt-8"} />}
            {isError && error != undefined && (
              <CenteredErrorMessage message={error.message} />
            )}
            {!isLoading && !isError && importerConnections.length === 0 && (
              <Text c={"dimmed"}>
                {t("importer.messages.noPlatformsAvailable")}
              </Text>
            )}
            <Group className={"w-full gap-5 justify-center"}>
              {importerConnections.map((connection) => {
                return (
                  <ImporterPlatform
                    key={connection.type}
                    type={
                      connection.type as unknown as UserConnectionDto.type
                    }
                    name={connection.name}
                    iconName={connection.iconName}
                    connection={ownConnectionsByType.get(
                      connection.type.valueOf(),
                    )}
                  />
                );
              })}
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </SessionAuth>
  );
};

export default Index;
