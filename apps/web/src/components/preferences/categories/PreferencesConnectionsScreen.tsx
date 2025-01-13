import React, { useMemo } from "react";
import { Group, Stack } from "@mantine/core";
import { useAvailableConnections } from "@/components/connections/hooks/useAvailableConnections";
import PreferencesConnectionItem from "@/components/preferences/handlers/connections/PreferencesConnectionItem";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

const PreferencesConnectionsScreen = () => {
    const { isLoading, isError, data } = useAvailableConnections();

    const items = useMemo(() => {
        if (data == undefined) {
            return;
        }

        return data.map((item) => {
            return (
                <PreferencesConnectionItem
                    key={item.type.valueOf()}
                    type={item.type}
                />
            );
        });
    }, [data]);

    return (
        <Stack w={"100%"} className={"items-center mt-4"}>
            <Stack className={"w-full my-4"}>
                {isLoading && <CenteredLoading />}
                {isError && (
                    <CenteredErrorMessage
                        message={
                            "Error while fetching available connections. Please refresh this page."
                        }
                    />
                )}
                {items}
            </Stack>
        </Stack>
    );
};

export default PreferencesConnectionsScreen;
