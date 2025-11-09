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

const Index = () => {
  const { data, isLoading, isError, error } = useOwnUserConnections();

  const importerUsableConnections = data?.filter(
    (connection) => connection.isImporterEnabled,
  );

  const isImportingAvailable =
    importerUsableConnections != undefined &&
    importerUsableConnections.length > 0;

  return (
    <SessionAuth>
      <Stack w={"100%"} justify={"center"} align={"center"}>
        <Paper className={"w-full lg:w-10/12 p-2 pb-8"}>
          <Stack className={"w-full h-full items-center"}>
            <Title size={"h4"}>
              GAME <span className={"text-[#F15025]"}>IMPORTER</span>
            </Title>

            <Text>
              The importer system helps you bring games from other platforms to
              GameNode.
            </Text>
            <Space h={"2rem"} />
            {isLoading && <CenteredLoading className={"mt-8"} />}
            {isError && <CenteredErrorMessage message={error.message} />}
            {!isLoading && !isError && !isImportingAvailable && (
              <Text c={"red"}>
                It seems like you don't have any connection set up for
                importing.{" "}
                <TextLink href={"/preferences/connections"}>
                  Click here
                </TextLink>{" "}
                to set one up.
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
