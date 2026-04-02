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
import { createErrorNotification } from "#@/util";
import { useTranslation } from "@repo/locales";

function parseSteamIdentifier(
  identifier: string,
  existingConnection: UserConnectionDto,
) {
  // If the identifier is already a full URL, return as is
  if (identifier.startsWith("http://") || identifier.startsWith("https://")) {
    return identifier;
  }

  if (identifier === existingConnection.sourceUsername) {
    return `https://steamcommunity.com/profiles/${existingConnection.sourceUserId}/`;
  }

  return `https://steamcommunity.com/id/${identifier}/`;
}

const createConnectionSetupFormSchema = (
  t: ReturnType<typeof useTranslation>["t"],
) =>
  z.object({
    userIdentifier: z
      .string()
      .min(1, t("preferences.validation.usernameRequired")),
    isAutoImportEnabled: z.boolean(),
    autoImportCollectionId: z.string().nullish(),
  });

type ConnectionSetupFormValues = z.infer<
  ReturnType<typeof createConnectionSetupFormSchema>
>;

export interface Props extends BaseModalChildrenProps {
  type: UserConnectionDto.type;
}

const PreferencesConnectionSetup = ({ type, onClose }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createConnectionSetupFormSchema(t), [t]);
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
      isAutoImportEnabled: false,
      autoImportCollectionId: undefined,
    },
    resolver: zodResolver(schema),
  });

  const userConnection = useOwnUserConnectionByType(type);
  const userLibrary = useUserLibrary(userId);

  const availableConnections = useAvailableConnections();

  const queryClient = useQueryClient();

  const connectionCreateMutation = useMutation({
    mutationFn: async (data: ConnectionSetupFormValues) => {
      if (type === UserConnectionDto.type.STEAM && userConnection.data) {
        data.userIdentifier = parseSteamIdentifier(
          data.userIdentifier,
          userConnection.data,
        );
      }

      await ConnectionsService.connectionsControllerCreateOrUpdateV1({
        type: type,
        userIdentifier: data.userIdentifier,
        isAutoImportEnabled: data.isAutoImportEnabled,
        autoImportCollectionId: data.autoImportCollectionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connections", "own"],
      });
      notifications.show({
        color: "green",
        message: t("preferences.messages.connectionSetup", {
          type: getCapitalizedText(type),
        }),
      });

      if (onClose) {
        onClose();
      }
    },
    onError: createErrorNotification,
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
        message: t("preferences.messages.connectionRemoved", {
          type: getCapitalizedText(type),
        }),
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

  const identifierInfo = useMemo((): {
    label: string;
    description: string;
  } => {
    return match<
      UserConnectionDto.type,
      { label: string; description: string }
    >(type)
      .with(UserConnectionDto.type.STEAM, () => ({
        label: t("preferences.labels.steamProfileUrl"),
        description: t("preferences.descriptions.steamProfileUrlExample"),
      }))
      .with(UserConnectionDto.type.PSN, () => ({
        label: t("preferences.labels.psnOnlineId"),
        description: t("preferences.descriptions.psnOnlineId"),
      }))
      .with(UserConnectionDto.type.XBOX, () => ({
        label: t("preferences.labels.gamertag"),
        description: t("preferences.descriptions.gamertag"),
      }))
      .exhaustive();
  }, [t, type]);

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
          <Stack className={"w-full"}>
            <Switch
              classNames={{
                labelWrapper: "grow",
              }}
              className={"w-full"}
              error={errors.isAutoImportEnabled?.message}
              label={t("preferences.labels.autoImport")}
              labelPosition={"left"}
              defaultChecked={
                userConnection.data
                  ? userConnection.data.isAutoImportEnabled
                  : false
              }
              description={t("preferences.descriptions.autoImport")}
              {...register("isAutoImportEnabled")}
            />
            {watch("isAutoImportEnabled") && (
              <Select
                label={t("preferences.labels.targetCollection")}
                description={t("preferences.descriptions.targetCollection")}
                placeholder={t("preferences.placeholders.none")}
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
          {t("actions.submit")}
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
            {t("actions.remove")}
          </Button>
        )}
      </Stack>
    </form>
  );
};

export { PreferencesConnectionSetup };
