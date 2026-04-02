import React, { useEffect, useMemo } from "react";
import {
  Button,
  ComboboxItem,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { z } from "zod";
import { PlaytimeService, UserPlaytime } from "@repo/wrapper/server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  useGame,
  usePlaytimeForGame,
  useUserId,
} from "#@/components";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";
import { DatePickerInput } from "@mantine/dates";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import source = UserPlaytime.source;
import dayjs from "dayjs";
import { useTranslation } from "@repo/locales";

const createPlaytimeSourceOptions = (
  t: ReturnType<typeof useTranslation>["t"],
): ComboboxItem[] => [
  {
    label: t("playtime.platforms.steam"),
    value: source.STEAM,
  },
  {
    label: t("playtime.platforms.psn"),
    value: source.PSN,
  },
  {
    label: t("playtime.platforms.epicGames"),
    value: source.EPICGAMES,
  },
  {
    label: t("playtime.platforms.gog"),
    value: source.GOG,
  },
  {
    label: t("playtime.platforms.battleNet"),
    value: source.BATTLENET,
  },
  {
    label: t("playtime.platforms.nintendoWii"),
    value: source.NWII,
  },
  {
    label: t("playtime.platforms.nintendoWiiU"),
    value: source.NWIIU,
  },
  {
    label: t("playtime.platforms.nintendoSwitch"),
    value: source.NSWITCH,
  },
  {
    label: t("playtime.platforms.emulator"),
    value: source.EMULATOR,
  },
  { label: t("playtime.platforms.xbox"), value: source.XBOX },
];

const createPlaytimeSubmitFormSchema = (
  t: ReturnType<typeof useTranslation>["t"],
) =>
  z.object({
    totalPlaytimeHours: z
      .number({ message: t("playtime.validation.numberRequired") })
      .min(0.1, t("playtime.validation.playtimeRequired")),
    lastPlayedDate: z.date().optional(),
    source: z.nativeEnum(UserPlaytime.source),
    platformId: z.number({
      message: t("playtime.validation.platformRequired"),
    }),
  });

type PlaytimeSubmitFormValues = z.infer<
  ReturnType<typeof createPlaytimeSubmitFormSchema>
>;

interface Props extends BaseModalChildrenProps {
  gameId: number;
}

const PlaytimeSubmitForm = ({ gameId, onClose }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();

  const PLAYTIME_SOURCE_OPTIONS = useMemo(
    () => createPlaytimeSourceOptions(t),
    [t],
  );

  const PlaytimeSubmitFormSchema = useMemo(
    () => createPlaytimeSubmitFormSchema(t),
    [t],
  );

  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const playtimeForGameQuery = usePlaytimeForGame(userId, gameId);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PlaytimeSubmitFormValues>({
    resolver: zodResolver(PlaytimeSubmitFormSchema),
    mode: "onSubmit",
    defaultValues: {
      totalPlaytimeHours: 0.1,
      lastPlayedDate: new Date(),
    },
  });

  const platformSelectOptions = useMemo(() => {
    return (
      gameQuery.data?.platforms?.map(
        (platform): ComboboxItem => ({
          label: platform.name,
          value: `${platform.id}`,
        }),
      ) ?? []
    );
  }, [gameQuery.data?.platforms]);

  const submitMutation = useMutation({
    mutationFn: async (data: PlaytimeSubmitFormValues) => {
      await PlaytimeService.playtimeControllerSubmitV1({
        gameId,
        lastPlayedDate: data.lastPlayedDate?.toISOString() ?? null,
        source: data.source,
        totalPlaytimeSeconds: Math.ceil(data.totalPlaytimeHours * 3600),
        platformId: data.platformId,
      });
    },
    onSettled: () => {
      playtimeForGameQuery.invalidate();
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("playtime.messages.sessionRecorded"),
      });
      onClose?.();
    },
    onError: createErrorNotification,
  });

  const selectedSource = watch("source");
  const selectedPlatformId = watch("platformId");

  useEffect(() => {
    if (playtimeForGameQuery.data) {
      const playtimeForSource = playtimeForGameQuery.data.find(
        (playtime) => playtime.source === selectedSource,
      );

      if (playtimeForSource) {
        if (playtimeForSource.lastPlayedDate) {
          setValue(
            "lastPlayedDate",
            new Date(playtimeForSource.lastPlayedDate),
          );
        }

        if (playtimeForSource.platformId) {
          setValue("platformId", playtimeForSource.platformId);
        }

        if (playtimeForSource.totalPlaytimeSeconds) {
          setValue(
            "totalPlaytimeHours",
            Math.ceil(playtimeForSource.totalPlaytimeSeconds / 3600),
          );
        }
      }
    }
  }, [playtimeForGameQuery.data, selectedSource, setValue]);

  return (
    <SessionAuth>
      <Stack className={"w-full gap-1"}>
        <Text>{t("playtime.hints.profileStats")}</Text>
        <Text className={"text-sm text-dimmed"}>
          {t("playtime.hints.autoImport")}
        </Text>
        <form
          className={"mt-4 flex flex-col gap-3 relative"}
          onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
        >
          {playtimeForGameQuery.isLoading && <LoadingOverlay />}
          <Group className={"flex-nowrap w-full"}>
            <Select
              {...register("platformId")}
              label={t("playtime.labels.platform")}
              withAsterisk
              value={`${selectedPlatformId}`}
              onChange={(v) => {
                if (v) {
                  setValue("platformId", Number.parseInt(v));
                }
              }}
              error={errors.platformId?.message}
              data={platformSelectOptions}
              allowDeselect={true}
            />
            <Select
              {...register("source")}
              withAsterisk
              label={t("playtime.labels.source")}
              error={errors.source?.message}
              data={PLAYTIME_SOURCE_OPTIONS}
              allowDeselect={true}
              value={selectedSource}
              onChange={(v) => {
                if (v) {
                  setValue("source", v as never);
                }
              }}
            />
          </Group>

          <NumberInput
            withAsterisk
            error={errors.totalPlaytimeHours?.message}
            defaultValue={0.1}
            min={0.1}
            max={undefined}
            value={watch("totalPlaytimeHours")}
            onChange={(v) => {
              setValue("totalPlaytimeHours", v as number);
            }}
            label={t("playtime.labels.totalPlaytime")}
            description={t("playtime.descriptions.totalPlaytime")}
          />
          <DatePickerInput
            label={t("playtime.labels.lastPlayedDate")}
            error={errors.lastPlayedDate?.message}
            description={t("collectionEntry.labels.optional")}
            defaultValue={new Date()}
            {...register("lastPlayedDate")}
            onChange={(date) => {
              setValue(
                "lastPlayedDate",
                date ? dayjs(date).toDate() : undefined,
              );
            }}
            allowDeselect={true}
          />

          <Button type={"submit"} loading={submitMutation.isPending}>
            {t("actions.submit")}
          </Button>
        </form>
      </Stack>
    </SessionAuth>
  );
};

export { PlaytimeSubmitForm };
