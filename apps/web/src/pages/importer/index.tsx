import React from "react";
import { Group, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ImporterPlatform,
  TextLink,
  useOwnUserConnections,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { NextPageContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { ConnectionsService } from "@repo/wrapper/server";

export const getServerSideProps = async (_context: NextPageContext) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["user", "connections"],
    queryFn: () => ConnectionsService.connectionsControllerFindOwnV1(),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const Index = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useOwnUserConnections();

  const importerUsableConnections = data?.filter(
    (connection) => connection.isImporterViable,
  );

  const isImportingAvailable =
    importerUsableConnections != undefined &&
    importerUsableConnections.length > 0;

  return (
    <SessionAuth>
      <Stack w={"100%"} justify={"center"} align={"center"}>
        <Paper className={"w-full p-2 pb-8"}>
          <Stack className={"w-full h-full items-center"}>
            <Title size={"h4"}>
              {t("importer.titlePrimary")}{" "}
              <span className={"text-[#F15025]"}>
                {t("importer.titleAccent")}
              </span>
            </Title>

            <Text>{t("importer.messages.overview")}</Text>
            <Space h={"2rem"} />
            {isLoading && <CenteredLoading className={"mt-8"} />}
            {isError && <CenteredErrorMessage message={error.message} />}
            {!isLoading && !isError && !isImportingAvailable && (
              <Text c={"red"}>
                {t("importer.messages.noConnectionsPrefix")}{" "}
                <TextLink href={"/preferences/connections"}>
                  {t("importer.messages.clickHere")}
                </TextLink>{" "}
                {t("importer.messages.noConnectionsSuffix")}
              </Text>
            )}
            <Group className={"w-full gap-5 justify-center"}>
              {importerUsableConnections?.map((connection) => {
                return (
                  <ImporterPlatform
                    key={connection.id}
                    connection={connection}
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
