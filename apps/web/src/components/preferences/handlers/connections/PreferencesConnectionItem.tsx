import React, { useCallback, useMemo } from "react";
import { UserConnectionDto } from "@/wrapper/server";
import type = UserConnectionDto.type;
import { useOwnUserConnectionByType } from "@/components/connections/hooks/useOwnUserConnectionByType";
import { useDisclosure } from "@mantine/hooks";
import { Group, Image, Paper, Stack, Switch, Text, Title } from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import PreferencesConnectionModal from "@/components/preferences/handlers/connections/PreferencesConnectionModal";

interface Props {
    type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
    const userConnection = useOwnUserConnectionByType(type);
    const [modalOpened, modalUtils] = useDisclosure();

    return (
        <Paper
            className={"rounded"}
            styles={{
                root: {
                    backgroundColor: "#161616",
                },
            }}
        >
            <Group className={"w-full h-full min-h-28 p-2 px-4"}>
                <PreferencesConnectionModal
                    type={type}
                    opened={modalOpened}
                    onClose={modalUtils.close}
                />
                <Image
                    alt={"Connection icon"}
                    src={getServerStoredIcon(type.valueOf())}
                    w={38}
                    h={38}
                />
                <Stack gap={3}>
                    {userConnection.data ? (
                        <>
                            <Title size={"h5"}>
                                {userConnection.data.sourceUsername}
                            </Title>
                            <Text c={"dimmed"}>Connected</Text>
                        </>
                    ) : (
                        <>
                            <Text>Not connected</Text>
                        </>
                    )}
                </Stack>
                <Stack className={"ms-auto me-4"}>
                    <Switch
                        checked={userConnection.data != undefined}
                        onChange={(v) => {
                            modalUtils.open();
                        }}
                    />
                </Stack>
            </Group>
        </Paper>
    );
};

export default PreferencesConnectionItem;
