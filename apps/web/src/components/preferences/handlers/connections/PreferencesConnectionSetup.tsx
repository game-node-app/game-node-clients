import React, { useEffect, useMemo } from "react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectionsService, UserConnectionDto } from "@/wrapper/server";
import { useOwnUserConnectionByType } from "@/components/connections/hooks/useOwnUserConnectionByType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/util/getErrorMessage";
import { getCapitalizedText } from "@/util/getCapitalizedText";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { Button, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useAvailableConnections } from "@/components/connections/hooks/useAvailableConnections";

const ConnectionSetupFormSchema = z.object({
    userIdentifier: z.string().min(1, "A username must be provided."),
    isImporterEnabled: z.boolean().default(true),
    isPlaytimeImportEnabled: z.boolean().default(true),
});

type ConnectionSetupFormValues = z.infer<typeof ConnectionSetupFormSchema>;

export interface Props extends BaseModalChildrenProps {
    type: UserConnectionDto.type;
}

const PreferencesConnectionSetup = ({ type, onClose }: Props) => {
    const {
        register,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<ConnectionSetupFormValues>({
        mode: "onBlur",
        defaultValues: {
            isImporterEnabled: true,
            isPlaytimeImportEnabled: true,
        },
        resolver: zodResolver(ConnectionSetupFormSchema),
    });

    const userConnection = useOwnUserConnectionByType(type);

    const availableConnections = useAvailableConnections();

    const queryClient = useQueryClient();

    const connectionCreateMutation = useMutation({
        mutationFn: async (data: ConnectionSetupFormValues) => {
            await ConnectionsService.connectionsControllerCreateOrUpdateV1({
                type: type,
                userIdentifier: data.userIdentifier,
                isImporterEnabled: data.isImporterEnabled,
                isPlaytimeImportEnabled: data.isPlaytimeImportEnabled,
            });
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: `Successfully set up ${getCapitalizedText(type)} connection!`,
            });
            if (onClose) {
                onClose();
            }
        },
        onError: (err) => {
            notifications.show({
                color: "red",
                message: getErrorMessage(err),
            });
        },
        onSettled: () => {
            queryClient.resetQueries({
                queryKey: ["connections", "own"],
            });
        },
    });

    const connectionDeleteMutation = useMutation({
        mutationFn: async () => {
            if (userConnection.data == undefined) {
                return;
            }

            return ConnectionsService.connectionsControllerDeleteV1(
                userConnection.data.id,
            );
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: `Successfully removed ${getCapitalizedText(type)} connection!`,
            });
            if (onClose) {
                onClose();
            }
        },
        onSettled: () => {
            queryClient.resetQueries({
                queryKey: ["connections"],
            });
        },
    });

    const isImporterViable = useMemo(() => {
        if (availableConnections.data != undefined) {
            return availableConnections.data.some((connection) => {
                return connection.type === type && connection.isImporterViable;
            });
        }

        return false;
    }, [availableConnections.data, type]);

    const isPlaytimeImportViable = useMemo(() => {
        if (availableConnections.data != undefined) {
            return availableConnections.data.some((connection) => {
                return (
                    connection.type === type &&
                    connection.isPlaytimeImportViable
                );
            });
        }

        return false;
    }, [availableConnections.data, type]);

    const identifierInfo = useMemo((): {
        label: string;
        description: string;
    } => {
        switch (type) {
            case UserConnectionDto.type.STEAM:
                return {
                    label: "Your public Steam profile URL",
                    description:
                        "e.g.: https://steamcommunity.com/id/your-username/",
                };
            case UserConnectionDto.type.PSN:
                return {
                    label: "Your PSN online id",
                    description: "Usually, it's your username.",
                };
        }
    }, [type]);

    /**
     * Effect to synchronize form state with user connection info.
     */
    useEffect(() => {
        if (userConnection.data) {
            setValue(
                "isImporterEnabled",
                userConnection.data.isImporterEnabled,
            );
        }
    }, [setValue, userConnection.data]);

    return (
        <form
            className={"w-full h-full"}
            onSubmit={handleSubmit((data) => {
                connectionCreateMutation.mutate(data);
            })}
        >
            <Stack className={"w-full h-full"}>
                {connectionCreateMutation.error && (
                    <CenteredErrorMessage
                        message={getErrorMessage(
                            connectionCreateMutation.error,
                        )}
                    />
                )}
                {connectionDeleteMutation.error && (
                    <CenteredErrorMessage
                        message={getErrorMessage(
                            connectionDeleteMutation.error,
                        )}
                    />
                )}
                <TextInput
                    error={errors.userIdentifier?.message}
                    label={identifierInfo.label}
                    description={identifierInfo.description}
                    defaultValue={userConnection.data?.sourceUsername}
                    {...register("userIdentifier")}
                />
                {isImporterViable && (
                    <Stack>
                        <Switch
                            error={errors.isImporterEnabled?.message}
                            label={"Allow importing"}
                            labelPosition={"left"}
                            defaultChecked={
                                userConnection.data
                                    ? userConnection.data.isImporterEnabled
                                    : true
                            }
                            description={
                                "If this connection can be used by the Importer system to import games."
                            }
                            {...register("isImporterEnabled")}
                        />
                    </Stack>
                )}
                {isPlaytimeImportViable && (
                    <Stack>
                        <Switch
                            error={errors.isPlaytimeImportEnabled?.message}
                            label={"Allow playtime importing"}
                            labelPosition={"left"}
                            defaultChecked={
                                userConnection.data
                                    ? userConnection.data
                                          .isPlaytimeImportEnabled
                                    : true
                            }
                            description={
                                "If playtime data can be imported from this collection, even for games not in your collection."
                            }
                            {...register("isPlaytimeImportEnabled")}
                        />
                    </Stack>
                )}

                <Button
                    type={"submit"}
                    loading={connectionCreateMutation.isPending}
                >
                    Submit
                </Button>
                {userConnection.data != undefined && (
                    <Button
                        color={"blue"}
                        type={"button"}
                        loading={connectionDeleteMutation.isPending}
                        onClick={() => {
                            connectionDeleteMutation.mutate();
                        }}
                    >
                        Disconnect
                    </Button>
                )}
            </Stack>
        </form>
    );
};

export default PreferencesConnectionSetup;
