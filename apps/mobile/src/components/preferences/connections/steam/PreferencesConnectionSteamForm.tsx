import React from "react";
import { Button, Modal, Stack, Switch, Text, TextInput } from "@mantine/core";
import { BaseModalChildrenProps, BaseModalProps } from "@/util/types/modal-props";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionCreateDto, ConnectionsService } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { useOwnUserConnectionByType } from "@/components/connections/hooks/useOwnUserConnectionByType";
import type = ConnectionCreateDto.type;

interface Props extends BaseModalChildrenProps {}

const PreferencesConnectionSteamForm = ({ onClose }: Props) => {
    const { watch, register, handleSubmit } = useForm<{
        query: string;
    }>({
        mode: "onSubmit",
    });

    const userConnection = useOwnUserConnectionByType(type.STEAM);

    const queryClient = useQueryClient();

    const connectionCreateMutation = useMutation({
        mutationFn: async (profileURL: string) => {
            try {
                await ConnectionsService.connectionsControllerCreateOrUpdateV1({
                    type: type.STEAM,
                    userIdentifier: profileURL,
                    isImporterEnabled: true,
                });
            } catch (err) {
                console.error(err);
                throw new Error("Invalid profile URL, please try again.");
            }
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Successfully set up Steam connection!",
            });
            if (onClose) {
                onClose();
            }
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

            return ConnectionsService.connectionsControllerDeleteV1(userConnection.data.id);
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Successfully removed Steam connection!",
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

    return (
        <form
            className={"w-full h-full"}
            onSubmit={handleSubmit((data) => {
                connectionCreateMutation.mutate(data.query);
            })}
        >
            <Stack className={"w-full h-full"}>
                {connectionCreateMutation.error && (
                    <CenteredErrorMessage message={connectionCreateMutation.error.message} />
                )}
                <TextInput
                    label={"Your public Steam profile url"}
                    description={"e.g.: https://steamcommunity.com/id/your-username/"}
                    defaultValue={userConnection.data?.sourceUsername}
                    {...register("query")}
                />
                <Text className={"text-xs"} c={"dimmed"}>
                    This connection can be used in our importer system to help you import games from this store. This
                    feature only works for public libraries.
                </Text>
                <Button type={"submit"} loading={connectionCreateMutation.isPending}>
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

export default PreferencesConnectionSteamForm;
