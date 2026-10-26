import { useEffect, useMemo } from "react";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApiError,
  ConnectionAuthInitDto,
  ConnectionsService,
  FindAvailableConnectionsResponseDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "#@/util/getErrorMessage";
import { getCapitalizedText } from "#@/util/getCapitalizedText";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { Button, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useAvailableConnections } from "#@/components/connections/hooks/useAvailableConnections";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createErrorNotification } from "#@/util";
import { useTranslation } from "@repo/locales";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";

const createConnectionSetupFormSchema = (
  usernameRequiredMessage: string,
  requiresIdentifier: boolean,
) =>
  z.object({
    userIdentifier: z
      .string()
      .trim()
      .min(requiresIdentifier ? 1 : 0, usernameRequiredMessage),
    isAutoImportEnabled: z.boolean(),
    autoImportCollectionId: z.string().nullish(),
  });

type ConnectionSetupFormValues = z.infer<
  ReturnType<typeof createConnectionSetupFormSchema>
>;

export interface Props extends BaseModalChildrenProps {
  type: UserConnectionDto.type;
  // eslint-disable-next-line no-unused-vars
  onRedirect?: (url: string) => void | Promise<void>;
}

const PreferencesConnectionSetup = ({
  type,
  onClose,
  onRedirect = (url) => window.location.assign(url),
}: Props) => {
  const { t } = useTranslation();
  const userConnection = useOwnUserConnectionByType(type);
  const availableConnections = useAvailableConnections();
  const provider = availableConnections.data?.find(
    (item) => item.type === type,
  );
  const isRedirect =
    provider?.authMode ===
    FindAvailableConnectionsResponseDto.authMode.REDIRECT;
  const requiresIdentifier =
    !userConnection.data &&
    provider?.authMode ===
      FindAvailableConnectionsResponseDto.authMode.PUBLIC_IDENTIFIER;
  const schema = useMemo(
    () =>
      createConnectionSetupFormSchema(
        t("preferences.validation.usernameRequired"),
        requiresIdentifier,
      ),
    [t, requiresIdentifier],
  );
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
      userIdentifier: "",
      isAutoImportEnabled: false,
      autoImportCollectionId: undefined,
    },
    resolver: zodResolver(schema),
  });

  const userLibrary = useUserLibrary(userId);

  const queryClient = useQueryClient();

  const connectionSaveMutation = useMutation({
    mutationFn: async (data: ConnectionSetupFormValues) => {
      const settings = {
        isAutoImportEnabled: data.isAutoImportEnabled,
        autoImportCollectionId: data.autoImportCollectionId,
      };
      if (userConnection.data) {
        return ConnectionsService.connectionsControllerUpdateSettingsV1(
          userConnection.data.id,
          settings,
        );
      }
      return ConnectionsService.connectionsControllerCreateOrUpdateV1({
        type,
        userIdentifier: data.userIdentifier,
        ...settings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connections"],
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

  const redirectMutation = useMutation({
    mutationFn: async (data: ConnectionAuthInitDto) => {
      const { authorizationUrl } =
        await ConnectionsService.connectionsControllerInitRedirectAuthV1(type, {
          isAutoImportEnabled: data.isAutoImportEnabled,
          autoImportCollectionId: data.autoImportCollectionId,
        });
      await onRedirect(authorizationUrl);
      onClose?.();
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
    onError: createErrorNotification,
  });

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

  if (availableConnections.isLoading || userConnection.isLoading) {
    return <CenteredLoading />;
  }
  if (availableConnections.error) {
    return <CenteredErrorMessage error={availableConnections.error} />;
  }
  if (
    userConnection.error &&
    !(
      userConnection.error instanceof ApiError &&
      userConnection.error.status === 404
    )
  ) {
    return <CenteredErrorMessage error={userConnection.error} />;
  }
  if (
    !provider ||
    (!isRedirect &&
      provider.authMode !==
        FindAvailableConnectionsResponseDto.authMode.PUBLIC_IDENTIFIER)
  ) {
    return (
      <CenteredErrorMessage
        message={t("preferences.messages.connectionUnsupported")}
      />
    );
  }

  const isPending =
    connectionSaveMutation.isPending ||
    redirectMutation.isPending ||
    connectionDeleteMutation.isPending;

  return (
    <form
      className={"w-full h-full"}
      onSubmit={handleSubmit((data) => {
        if (isRedirect && !userConnection.data) {
          redirectMutation.mutate(data);
        } else {
          connectionSaveMutation.mutate(data);
        }
      })}
    >
      <Stack className={"w-full h-full"}>
        {connectionSaveMutation.error && (
          <CenteredErrorMessage
            message={getErrorMessage(connectionSaveMutation.error)}
          />
        )}
        {connectionDeleteMutation.error && (
          <CenteredErrorMessage
            message={getErrorMessage(connectionDeleteMutation.error)}
          />
        )}
        {redirectMutation.error && (
          <CenteredErrorMessage error={redirectMutation.error} />
        )}
        {userConnection.data && (
          <Text>{userConnection.data.sourceUsername}</Text>
        )}
        {userConnection.data?.authStatus ===
          UserConnectionDto.authStatus.REAUTH_REQUIRED && (
          <Text c="orange">{t("preferences.messages.reauthRequired")}</Text>
        )}
        {isRedirect && (
          <Text>
            {t("preferences.descriptions.redirectConnection", {
              type: getConnectionName(type),
            })}
          </Text>
        )}
        {type === UserConnectionDto.type.STEAM && (
          <Text c="dimmed">
            {t("preferences.descriptions.steamPublicGames")}
          </Text>
        )}
        {requiresIdentifier && (
          <TextInput
            error={errors.userIdentifier?.message}
            label={t("preferences.labels.psnOnlineId")}
            description={t("preferences.descriptions.psnOnlineId")}
            {...register("userIdentifier")}
          />
        )}
        {provider.isImporterViable && (
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

        <Button
          type={"submit"}
          loading={
            connectionSaveMutation.isPending ||
            (!userConnection.data && redirectMutation.isPending)
          }
          disabled={isPending}
        >
          {isRedirect && !userConnection.data
            ? t("preferences.actions.connect", {
                type: getConnectionName(type),
              })
            : t("actions.submit")}
        </Button>
        {isRedirect && userConnection.data && (
          <Button
            type="button"
            loading={redirectMutation.isPending}
            disabled={isPending}
            onClick={handleSubmit((data) => redirectMutation.mutate(data))}
          >
            {t("preferences.actions.reconnect")}
          </Button>
        )}
        {userConnection.data != undefined && (
          <Button
            color={"blue"}
            type={"button"}
            loading={connectionDeleteMutation.isPending}
            disabled={isPending}
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
