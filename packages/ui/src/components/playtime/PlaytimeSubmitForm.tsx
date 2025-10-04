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

const PLAYTIME_SOURCE_OPTIONS: ComboboxItem[] = [
  {
    label: "Steam",
    value: source.STEAM,
  },
  {
    label: "PSN",
    value: source.PSN,
  },
  {
    label: "EpicGames",
    value: source.EPICGAMES,
  },
  {
    label: "GOG",
    value: source.GOG,
  },
  {
    label: "Battle.net",
    value: source.BATTLENET,
  },
  {
    label: "Nintendo Wii",
    value: source.NWII,
  },
  {
    label: "Nintendo Wii U",
    value: source.NWIIU,
  },
  {
    label: "Nintendo Switch",
    value: source.NSWITCH,
  },
  {
    label: "Emulator",
    value: source.EMULATOR,
  },
  { label: "Xbox", value: source.XBOX },
];

const PlaytimeSubmitFormSchema = z.object({
  totalPlaytimeHours: z
    .number({ message: "Total playtime must be a number." })
    .min(0.1, "Total playtime must be provided."),
  lastPlayedDate: z.date().optional(),
  source: z.nativeEnum(UserPlaytime.source),
  platformId: z.number({ message: "A platform must be selected." }),
});

type PlaytimeSubmitFormValues = z.infer<typeof PlaytimeSubmitFormSchema>;

interface Props extends BaseModalChildrenProps {
  gameId: number;
}

const PlaytimeSubmitForm = ({ gameId, onClose }: Props) => {
  const userId = useUserId();

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
        message: "Play session recorded successfully",
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
        <Text>
          Your playtime info helps us build your profile stats, wrapped items,
          and more.
        </Text>
        <Text className={"text-sm text-dimmed"}>
          We highly recommend setting up your connections to automatically
          import your playtime data. This data may be overwritten if we find
          playtime data for this game in one of your connections.
        </Text>
        <form
          className={"mt-4 flex flex-col gap-3 relative"}
          onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
        >
          {playtimeForGameQuery.isLoading && <LoadingOverlay />}
          <Group className={"flex-nowrap w-full"}>
            <Select
              {...register("platformId")}
              label={"Platform"}
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
              label={"Source"}
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
            label={"Total playtime"}
            description={
              "In hours. This is the total playtime you have for this game."
            }
          />
          <DatePickerInput
            label={"Last played date"}
            error={errors.lastPlayedDate?.message}
            description={"Optional."}
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
            Submit
          </Button>
        </form>
      </Stack>
    </SessionAuth>
  );
};

export { PlaytimeSubmitForm };
