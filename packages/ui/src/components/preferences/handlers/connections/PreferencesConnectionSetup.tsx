import React, { useEffect, useMemo } from "react";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectionsService, UserConnectionDto } from "@repo/wrapper/server";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "#@/util/getErrorMessage";
import { getCapitalizedText } from "#@/util/getCapitalizedText";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { Button, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useAvailableConnections } from "#@/components/connections/hooks/useAvailableConnections";
import { match } from "ts-pattern";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { useUserId } from "#@/components/auth/hooks/useUserId";

const ConnectionSetupFormSchema = z
  .object({
    userIdentifier: z.string().min(1, "A username must be provided."),
    isImporterEnabled: z.boolean(),
    isPlaytimeImportEnabled: z.boolean(),
    isAutoImportEnabled: z.boolean(),
    autoImportCollectionId: z.string().nullish(),
  })
  .refine((data) => !(data.isAutoImportEnabled && !data.isImporterEnabled), {
    error: "Auto importing can only be enabled if importing is allowed.",
    path: ["isAutoImportEnabled"],
  });

type ConnectionSetupFormValues = z.infer<typeof ConnectionSetupFormSchema>;

export interface Props extends BaseModalChildrenProps {
  type: UserConnectionDto.type;
}

const PreferencesConnectionSetup = ({ type, onClose }: Props) => {
  const userId = useUserId();
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
      isAutoImportEnabled: false,
      autoImportCollectionId: undefined,
    },
    resolver: zodResolver(ConnectionSetupFormSchema),
  });

  const userConnection = useOwnUserConnectionByType(type);
  const userLibrary = useUserLibrary(userId);

  const availableConnections = useAvailableConnections();

  const queryClient = useQueryClient();

  const connectionCreateMutation = useMutation({
    mutationFn: async (data: ConnectionSetupFormValues) => {
      await ConnectionsService.connectionsControllerCreateOrUpdateV1({
        type: type,
        userIdentifier: data.userIdentifier,
        isImporterEnabled: data.isImporterEnabled,
        isPlaytimeImportEnabled: data.isPlaytimeImportEnabled,
        isAutoImportEnabled: data.isAutoImportEnabled,
        autoImportCollectionId: data.autoImportCollectionId,
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
        return connection.type === type && connection.isPlaytimeImportViable;
      });
    }

    return false;
  }, [availableConnections.data, type]);

  const identifierInfo = useMemo((): {
    label: string;
    description: string;
  } => {
    return match<
      UserConnectionDto.type,
      { label: string; description: string }
    >(type)
      .with(UserConnectionDto.type.STEAM, () => ({
        label: "Your public Steam profile URL",
        description: "e.g.: https://steamcommunity.com/id/your-username/",
      }))
      .with(UserConnectionDto.type.PSN, () => ({
        label: "Your PSN online id",
        description: "Usually, it's your username.",
      }))
      .with(UserConnectionDto.type.XBOX, () => ({
        label: "Your Gamertag",
        description: "It's the name that appears on your console or Xbox apps.",
      }))
      .exhaustive();
  }, [type]);

  const collectionSelectData = useMemo(() => {
    return (
      userLibrary.data?.collections.map((collection) => ({
        value: collection.id,
        label: collection.name,
      })) ?? []
    );
  }, [userLibrary.data]);

  /**
   * Effect to synchronize form state with user connection info.
   */
  useEffect(() => {
    if (userConnection.data) {
      setValue("isImporterEnabled", userConnection.data.isImporterEnabled);
      setValue("isAutoImportEnabled", userConnection.data.isAutoImportEnabled);
      setValue(
        "autoImportCollectionId",
        userConnection.data.autoImportCollectionId,
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
            message={getErrorMessage(connectionCreateMutation.error)}
          />
        )}
        {connectionDeleteMutation.error && (
          <CenteredErrorMessage
            message={getErrorMessage(connectionDeleteMutation.error)}
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
              className={"w-full"}
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
              className={"w-full"}
              error={errors.isPlaytimeImportEnabled?.message}
              label={"Allow playtime importing"}
              labelPosition={"left"}
              defaultChecked={
                userConnection.data
                  ? userConnection.data.isPlaytimeImportEnabled
                  : true
              }
              description={
                "If playtime data can be imported from this collection, even for games not in your collection."
              }
              {...register("isPlaytimeImportEnabled")}
            />
          </Stack>
        )}
        {isImporterViable && (
          <Stack>
            <Switch
              className={"w-full"}
              error={errors.isAutoImportEnabled?.message}
              label={"Enable automatic importing"}
              labelPosition={"left"}
              defaultChecked={
                userConnection.data
                  ? userConnection.data.isAutoImportEnabled
                  : false
              }
              description={
                "Automatically import newly detected games to your library."
              }
              {...register("isAutoImportEnabled")}
            />
            {watch("isAutoImportEnabled") && (
              <Select
                label={"Target collection (optional)"}
                description={
                  "Games will be added directly to your library if not specified."
                }
                placeholder={"None"}
                clearable
                data={collectionSelectData}
                value={watch("autoImportCollectionId")}
                onChange={(value) => setValue("autoImportCollectionId", value)}
                error={errors.autoImportCollectionId?.message}
              />
            )}
          </Stack>
        )}

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

export { PreferencesConnectionSetup };
