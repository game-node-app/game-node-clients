import React, { useMemo } from "react";
import { UserConnectionDto } from "@/wrapper/server";
import { Button, Image, Paper, Stack, Title } from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { getConnectionName } from "@/components/connections/util/getConnectionName";

interface Props {
    connection: UserConnectionDto;
}

const ImporterItem = ({ connection }: Props) => {
    const connectionName = useMemo(() => getConnectionName(connection.type), [connection.type]);
    return (
        <Paper className={"h-56 w-56"}>
            <Stack className={"w-full h-full items-center"}>
                <Image
                    alt={"Importer source icon"}
                    src={getServerStoredIcon(connection.type.valueOf())}
                    w={48}
                    h={48}
                    className={"mt-6"}
                />
                <Title size={"h4"}>{connectionName}</Title>
                <Link to={getTabAwareHref(`/importer/${connection.type.valueOf()}`)} className={"w-9/12 mt-auto mb-4"}>
                    <Button className={"w-full "}>Import</Button>
                </Link>
            </Stack>
        </Paper>
    );
};

export default ImporterItem;
