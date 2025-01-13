import React from "react";
import { Group, Image, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { useOwnUserConnections } from "@/components/connections/hooks/useOwnUserConnections";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import Link from "next/link";
import TextLink from "@/components/general/TextLink";
import ImporterItem from "@/components/importer/view/ImporterItem";

const Index = () => {
    const { data, isLoading, isError, error } = useOwnUserConnections();

    const importerUsableConnections = data?.filter(
        (connection) => connection.isImporterEnabled,
    );

    const isImportingAvailable =
        importerUsableConnections != undefined &&
        importerUsableConnections.length > 0;

    return (
        <Stack w={"100%"} justify={"center"} align={"center"}>
            <Paper className={"w-full lg:w-10/12 p-2 pb-8"}>
                <Stack className={"w-full h-full items-center"}>
                    <Title size={"h4"}>
                        GAME <span className={"text-[#F15025]"}>IMPORTER</span>
                    </Title>

                    <Text>
                        The importer system helps you bring games from other
                        platforms to GameNode.
                    </Text>
                    <Space h={"2rem"} />
                    {isLoading && <CenteredLoading className={"mt-8"} />}
                    {isError && (
                        <CenteredErrorMessage message={error.message} />
                    )}
                    {!isLoading && !isError && !isImportingAvailable && (
                        <Text c={"red"}>
                            It seems like you don't have any connection set up
                            for importing.{" "}
                            <TextLink span href={"/preferences/connections"}>
                                Click here
                            </TextLink>{" "}
                            to set one up.
                        </Text>
                    )}
                    <Group className={"w-full gap-5 justify-center"}>
                        {importerUsableConnections?.map((connection) => {
                            return (
                                <ImporterItem
                                    key={connection.id}
                                    connection={connection}
                                />
                            );
                        })}
                    </Group>
                </Stack>
            </Paper>
        </Stack>
    );
};

export default Index;
