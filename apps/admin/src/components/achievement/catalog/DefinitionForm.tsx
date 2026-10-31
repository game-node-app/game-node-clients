import React, { useEffect } from "react";
import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { createErrorNotification } from "@repo/ui";
import {
  AchievementDefinition,
  AchievementEvent,
  AchievementIconDto,
  AchievementsAdminService,
} from "@repo/wrapper/server";
import { ConfirmButton } from "./ConfirmButton";
import { CriteriaFields } from "./CriteriaFields";
import { IconPicker } from "./IconPicker";
import { SimulatePanel } from "./SimulatePanel";
import {
  useAdminDefinition,
  useAdminEvents,
  useAdminMetrics,
  useInvalidateAchievementCatalog,
} from "./hooks";
import { definitionFormSchema, DefinitionFormValues } from "./schemas";

const RETROACTIVE_WARNING =
  "Users who already qualify will be granted the new tiers retroactively and silently.";

const DEFAULT_VALUES: DefinitionFormValues = {
  id: "",
  name: "",
  description: "",
  metric: "",
  criteria: {},
  startsAt: null,
  endsAt: null,
  eventId: null,
  icon: { kind: "glyph", name: "trophy" },
  isHidden: false,
  tiers: [{ threshold: 1, expReward: 100 }],
};

const DefinitionForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const isNew = id === "new";
  const definitionQuery = useAdminDefinition(id);
  const definition = definitionQuery.data;
  const metricsQuery = useAdminMetrics();
  const eventsQuery = useAdminEvents();
  const invalidate = useInvalidateAchievementCatalog();

  const isDraft =
    isNew || definition?.status === AchievementDefinition.status.DRAFT;
  const isArchived =
    definition?.status === AchievementDefinition.status.ARCHIVED;
  // Tiers already saved on a published definition cannot change.
  const lockedTierCount = isDraft ? 0 : (definition?.tiers.length ?? 0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DefinitionFormValues>({
    resolver: zodResolver(definitionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const tiers = useFieldArray({ control, name: "tiers" });

  useEffect(() => {
    if (!definition) return;
    reset({
      id: definition.id,
      name: definition.name,
      description: definition.description,
      metric: definition.metric,
      criteria: definition.criteria,
      startsAt: definition.startsAt ? new Date(definition.startsAt) : null,
      endsAt: definition.endsAt ? new Date(definition.endsAt) : null,
      eventId: definition.eventId,
      icon: definition.icon as DefinitionFormValues["icon"],
      isHidden: definition.isHidden,
      tiers: [...definition.tiers]
        .sort((a, b) => a.level - b.level)
        .map(({ threshold, expReward }) => ({ threshold, expReward })),
    });
  }, [definition, reset]);

  const metricKey = watch("metric");
  const eventId = watch("eventId");
  const metric = metricsQuery.data?.find((m) => m.key === metricKey);
  const rulesDisabled = !isDraft;
  const windowDisabled = rulesDisabled || !metric?.supportsWindow;

  const saveMutation = useMutation({
    mutationFn: async (data: DefinitionFormValues) => {
      const icon = {
        kind: data.icon.kind as AchievementIconDto.kind,
        ...(data.icon.kind === "game_cover"
          ? { gameId: data.icon.gameId }
          : { name: data.icon.name }),
      };
      const editable = {
        name: data.name,
        description: data.description,
        icon,
        isHidden: data.isHidden,
        tiers: data.tiers,
      };
      if (!isNew && !isDraft) {
        return AchievementsAdminService.achievementsAdminControllerUpdateDefinitionV1(
          id,
          editable,
        );
      }
      const criteria = Object.fromEntries(
        Object.entries(data.criteria).filter(
          ([key, v]) =>
            metric?.filters.includes(key) &&
            v !== undefined &&
            !(Array.isArray(v) && v.length === 0),
        ),
      );
      const rules = {
        ...editable,
        metric: data.metric,
        criteria,
        startsAt: data.startsAt?.toISOString() ?? null,
        endsAt: data.endsAt?.toISOString() ?? null,
        eventId: data.eventId,
        category: (definition?.category ??
          (data.eventId ? 5 : 4)) as AchievementDefinition.category,
      };
      return isNew
        ? AchievementsAdminService.achievementsAdminControllerCreateDefinitionV1(
            {
              ...rules,
              id: data.id,
            },
          )
        : AchievementsAdminService.achievementsAdminControllerUpdateDefinitionV1(
            id,
            rules,
          );
    },
    onError: createErrorNotification,
    onSuccess: async (saved) => {
      await invalidate();
      notifications.show({ message: "Definition saved.", color: "green" });
      if (isNew) {
        await router.push(`/dashboard/achievement/definitions/${saved.id}`);
      }
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "publish" | "archive" | "delete") => {
      switch (action) {
        case "publish":
          return AchievementsAdminService.achievementsAdminControllerPublishDefinitionV1(
            id,
          );
        case "archive":
          return AchievementsAdminService.achievementsAdminControllerArchiveDefinitionV1(
            id,
          );
        case "delete":
          return AchievementsAdminService.achievementsAdminControllerDeleteDefinitionV1(
            id,
          );
      }
    },
    onError: createErrorNotification,
    onSuccess: async (_, action) => {
      await invalidate();
      if (action === "delete") {
        await router.push("/dashboard/achievement/definitions");
      }
    },
  });

  const submit = handleSubmit((data) => saveMutation.mutate(data));
  const addsTiers = !isDraft && tiers.fields.length > lockedTierCount;

  return (
    <Stack className={"w-full"} maw={800}>
      <form onSubmit={submit}>
        <Stack className={"w-full relative"}>
          <LoadingOverlay
            visible={
              definitionQuery.isLoading ||
              saveMutation.isPending ||
              actionMutation.isPending
            }
          />
          {definition && <Text>Status: {definition.status}</Text>}
          <TextInput
            label={"Slug"}
            description={"Stable id, cannot be changed after creation"}
            disabled={!isNew}
            error={errors.id?.message}
            {...register("id")}
          />
          <TextInput
            label={"Name"}
            disabled={isArchived}
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            label={"Description"}
            disabled={isArchived}
            error={errors.description?.message}
            {...register("description")}
          />
          <Controller
            control={control}
            name={"metric"}
            render={({ field }) => (
              <Select
                label={"Metric"}
                description={metric?.description}
                data={(metricsQuery.data ?? []).map((m) => ({
                  value: m.key,
                  label: m.key,
                }))}
                value={field.value || null}
                onChange={(v) => {
                  field.onChange(v ?? "");
                  setValue("criteria", {});
                }}
                disabled={rulesDisabled}
                error={errors.metric?.message}
                searchable
              />
            )}
          />
          {metric && (
            <Controller
              control={control}
              name={"criteria"}
              render={({ field }) => (
                <CriteriaFields
                  filters={metric.filters}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={rulesDisabled}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name={"eventId"}
            render={({ field }) => (
              <Select
                label={"Event"}
                description={"Linking an event replaces the own time window"}
                data={(eventsQuery.data ?? [])
                  .filter(
                    (e) =>
                      e.status !== AchievementEvent.status.ARCHIVED ||
                      e.id === field.value,
                  )
                  .map((e) => ({ value: e.id, label: e.name }))}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  if (v) {
                    setValue("startsAt", null);
                    setValue("endsAt", null);
                  }
                }}
                clearable
                disabled={windowDisabled}
              />
            )}
          />
          {(["startsAt", "endsAt"] as const).map((name) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <DateTimePicker
                  label={name === "startsAt" ? "Window start" : "Window end"}
                  value={field.value}
                  onChange={(v) => field.onChange(v ? new Date(v) : null)}
                  clearable
                  disabled={windowDisabled || !!eventId}
                  error={errors[name]?.message}
                />
              )}
            />
          ))}
          <Text fw={500}>Tiers</Text>
          {tiers.fields.map((field, index) => {
            const locked = index < lockedTierCount;
            return (
              <Group key={field.id} align={"start"} wrap={"nowrap"}>
                <Text className={"pt-8"}>#{index + 1}</Text>
                <Controller
                  control={control}
                  name={`tiers.${index}.threshold`}
                  render={({ field: f }) => (
                    <NumberInput
                      label={"Threshold"}
                      min={1}
                      value={f.value}
                      onChange={(v) =>
                        f.onChange(v === "" ? undefined : Number(v))
                      }
                      disabled={locked || isArchived}
                      error={errors.tiers?.[index]?.threshold?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`tiers.${index}.expReward`}
                  render={({ field: f }) => (
                    <NumberInput
                      label={"XP reward"}
                      min={0}
                      max={5000}
                      value={f.value}
                      onChange={(v) =>
                        f.onChange(v === "" ? undefined : Number(v))
                      }
                      disabled={locked || isArchived}
                      error={errors.tiers?.[index]?.expReward?.message}
                    />
                  )}
                />
                {!locked && !isArchived && (
                  <ActionIcon
                    className={"mt-7"}
                    color={"red"}
                    variant={"subtle"}
                    aria-label={"Remove tier"}
                    onClick={() => tiers.remove(index)}
                  >
                    <IconTrash />
                  </ActionIcon>
                )}
              </Group>
            );
          })}
          {(errors.tiers?.message || errors.tiers?.root?.message) && (
            <Text c={"red"} size={"sm"}>
              {errors.tiers?.message ?? errors.tiers?.root?.message}
            </Text>
          )}
          {!isArchived && tiers.fields.length < 10 && (
            <Button
              variant={"default"}
              onClick={() => {
                const last = tiers.fields[tiers.fields.length - 1];
                const lastThreshold = watch(
                  `tiers.${tiers.fields.length - 1}.threshold`,
                );
                tiers.append({
                  threshold: (lastThreshold ?? last?.threshold ?? 0) + 1,
                  expReward: 100,
                });
              }}
            >
              Add tier
            </Button>
          )}
          <Controller
            control={control}
            name={"icon"}
            render={({ field }) => (
              <IconPicker
                value={
                  field.value as React.ComponentProps<
                    typeof IconPicker
                  >["value"]
                }
                onChange={field.onChange}
                tierCount={tiers.fields.length}
                disabled={isArchived}
              />
            )}
          />
          <Controller
            control={control}
            name={"isHidden"}
            render={({ field }) => (
              <Switch
                label={"Secret"}
                description={
                  "Hidden from users until they obtain it (name, description and icon are masked)"
                }
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
                disabled={isArchived}
              />
            )}
          />
          {!isArchived && (
            <Group justify={"end"}>
              {!isNew && isDraft && (
                <ConfirmButton
                  label={"Delete draft"}
                  color={"red"}
                  message={"Delete this draft definition?"}
                  onConfirm={() => actionMutation.mutate("delete")}
                />
              )}
              {!isNew && isDraft && (
                <ConfirmButton
                  label={"Publish"}
                  message={`Publishing locks the rules. ${RETROACTIVE_WARNING}`}
                  onConfirm={() => actionMutation.mutate("publish")}
                />
              )}
              {!isNew && !isDraft && (
                <ConfirmButton
                  label={"Archive"}
                  color={"red"}
                  message={
                    "Archive this definition? Users keep what they obtained."
                  }
                  onConfirm={() => actionMutation.mutate("archive")}
                />
              )}
              {addsTiers ? (
                <ConfirmButton
                  label={"Save"}
                  variant={"filled"}
                  message={RETROACTIVE_WARNING}
                  onConfirm={() => submit()}
                />
              ) : (
                <Button type={"submit"}>Save</Button>
              )}
            </Group>
          )}
        </Stack>
      </form>
      {!isNew && <SimulatePanel definitionId={id} />}
    </Stack>
  );
};

export { DefinitionForm };
