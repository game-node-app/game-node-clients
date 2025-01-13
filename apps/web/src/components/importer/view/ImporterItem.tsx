import React, { useMemo } from "react";
import { UserConnectionDto } from "@/wrapper/server";
import { Button, Image, Paper, Stack, Title } from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import Link from "next/link";

interface Props {
    connection: UserConnectionDto;
}

const connectionTypeToName = (type: UserConnectionDto.type) => {
    switch (type) {
        case UserConnectionDto.type.STEAM:
            return "Steam";
        case UserConnectionDto.type.PSN:
            return "Playstation Network";
        default:
            return "Name not available";
    }
};

const ImporterItem = ({ connection }: Props) => {
    const connectionName = useMemo(
        () => connectionTypeToName(connection.type),
        [connection.type],
    );
    return (
        <Paper
            style={{
                backgroundColor: "#141414",
            }}
            className={"h-56 w-56"}
        >
            <Stack className={"w-full h-full items-center"}>
                <Image
                    alt={"Importer source icon"}
                    src={getServerStoredIcon(connection.type.valueOf())}
                    w={48}
                    h={48}
                    className={"mt-6"}
                />
                <Title size={"h4"}>{connectionName}</Title>
                <Link
                    href={`/importer/${connection.type.valueOf()}`}
                    className={"w-9/12 mt-auto mb-4"}
                >
                    <Button className={"w-full "}>Import</Button>
                </Link>
            </Stack>
        </Paper>
    );
};

export default ImporterItem;
