import {
  Box,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  type SwitchProps,
} from "@mantine/core";
import { useMutationState } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import {
  ApiError,
  ConnectionCreateDto,
  type SupporterPreferencesResponseDto,
  type UpdateSupporterPreferencesDto,
} from "@repo/wrapper/server";
import {
  IconAlertTriangle,
  IconBroadcast,
  IconBrush,
  IconCheck,
  IconCircleDashed,
  IconCrown,
  IconHeart,
  IconLock,
  IconPalette,
  IconPhoto,
  IconProps,
  IconStack2,
  IconTag,
} from "@tabler/icons-react";
import { type ComponentType, type ReactNode } from "react";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import {
  SettingsComingSoonBadge,
  SettingsPill,
} from "#@/components/settings/common/SettingsPill";
import {
  SettingsIconTile,
  SettingsRow,
} from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { Link } from "#@/util";
import { useUpdateSupporterPreferences } from "../hooks/useUpdateSupporterPreferences";
import { SUPPORTER_PREFERENCES_MUTATION_KEY } from "../hooks/supporterQueryKeys";
import {
  DEFAULT_SUPPORTER_PREFERENCES,
  type ActiveSupporterPerks,
} from "../perks/supporterPerks";
import { SupporterAccentPicker } from "../perks/SupporterAccentPicker";
import {
  getSupporterTitleLabelKey,
  SUPPORTER_TITLE_KEYS,
} from "../perks/supporterTitles";
import { SupporterProfilePreview } from "./SupporterProfilePreview";

export type SupporterPerksSettingsMode = "edit" | "locked" | "unavailable";

export interface SupporterPerksSettingsProps {
  /**
   * `edit`: the profile read returned preferences, controls are live.
   * `locked`: no entitlement; the same rows are disabled with a lock (D9).
   * `unavailable`: billing says supporter but the profile read has no
   * preferences yet; controls are disabled with a retry (D7).
   */
  mode: SupporterPerksSettingsMode;
  /** Stored preferences; `null` outside `edit`. */
  prefs: SupporterPreferencesResponseDto | null;
  /** Values for the preview (current for `edit`, defaults otherwise). */
  perks: ActiveSupporterPerks | null;
  /** Caption above the preview. */
  caption: ReactNode;
  /** Wall membership line in the preview; `null` hides it. */
  onWall: boolean | null;
  supporterSince: string | null;
  /** Whether this surface renders its own wall (mobile); web links to it. */
  withSupportersWall?: boolean;
  /** Retries the own profile read in `unavailable` mode. */
  onRetry?: () => void;
  className?: string;
}

const TILE_CLASS = "bg-[rgba(151,71,255,0.16)]";
const TILE_ICON_CLASS = "text-[#c7a6ff]";

interface PerkIconTileProps {
  Icon: ComponentType<IconProps>;
}

function PerkIconTile({ Icon }: PerkIconTileProps) {
  return (
    <SettingsIconTile
      Icon={Icon}
      className={TILE_CLASS}
      iconClassName={TILE_ICON_CLASS}
    />
  );
}

interface PerkSwitchProps extends Omit<SwitchProps, "checked" | "onChange"> {
  checked: boolean;
  locked: boolean;
  onChange: (checked: boolean) => void;
}

/** Switch row control: plain when editable, locked and disabled otherwise. */
function PerkSwitch({
  checked,
  locked,
  onChange,
  disabled,
  ...others
}: PerkSwitchProps) {
  if (locked) {
    return (
      <Group gap={8} wrap={"nowrap"}>
        <IconLock
          data-testid={"supporter-perk-lock"}
          size={14}
          color={"#adadad"}
          aria-hidden
        />
        <Switch size={"md"} checked={checked} disabled {...others} />
      </Group>
    );
  }

  return (
    <Switch
      size={"md"}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.checked)}
      {...others}
    />
  );
}

/**
 * Steam hint under the live-profile row. Mounted only in `edit` mode so the
 * locked view never issues the connection lookup (design D7/D9).
 */
function LiveProfileDescription() {
  const { t } = useTranslation();
  const connectionQuery = useOwnUserConnectionByType(
    ConnectionCreateDto.type.STEAM,
  );
  const hasNoConnection =
    (connectionQuery.isError &&
      connectionQuery.error instanceof ApiError &&
      connectionQuery.error.status === 404) ||
    (connectionQuery.isSuccess && !connectionQuery.data);

  return (
    <>
      <Text component={"span"} fz={13} lh={"18px"} className={"text-[#adadad]"}>
        {t("supporter.perks.live.description")}
      </Text>
      {hasNoConnection && (
        <Text
          component={"span"}
          fz={13}
          lh={"18px"}
          className={"block text-[#ffb224]"}
        >
          {t("supporter.perks.live.needsSteam")}
        </Text>
      )}
    </>
  );
}

/**
 * "How you appear" supporter settings (design D7/D9): one row per preference
 * saved immediately through the partial preferences mutation, next to a live
 * preview; free users get the same rows locked. A Library card lists the
 * shipped collection perk and the upcoming custom covers.
 */
export function SupporterPerksSettings({
  mode,
  prefs,
  perks,
  caption,
  onWall,
  supporterSince,
  withSupportersWall = false,
  onRetry,
  className,
}: SupporterPerksSettingsProps) {
  const { t } = useTranslation();
  const mutation = useUpdateSupporterPreferences();
  const mutationStatuses = useMutationState({
    filters: { mutationKey: SUPPORTER_PREFERENCES_MUTATION_KEY },
    select: (current) => current.state.status,
  });

  const isLocked = mode === "locked";
  const isUnavailable = mode === "unavailable";
  const values = prefs ?? DEFAULT_SUPPORTER_PREFERENCES;
  const update = (patch: UpdateSupporterPreferencesDto) => mutation.mutate(patch);

  const isSaving = mutationStatuses.includes("pending");
  const lastStatus = mutationStatuses[mutationStatuses.length - 1];
  const isSaved = !isSaving && lastStatus === "success";

  const titleOptions = [
    { value: "", label: t("supporter.perks.titleSelect.none") },
    ...SUPPORTER_TITLE_KEYS.map((key) => ({
      value: key,
      label: t(getSupporterTitleLabelKey(key)),
    })).sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const switchLabel = (title: string) =>
    isLocked
      ? `${title}, ${t("supporter.perks.locked.label")}`
      : title;

  return (
    <SettingsSection
      title={t("supporter.perks.heading")}
      description={t("supporter.perks.description")}
      rightSection={
        mode === "edit" ? (
          isSaving ? (
            <Text fz={12} lh={"normal"} className={"text-[#adadad]"}>
              {t("supporter.perks.saving")}
            </Text>
          ) : isSaved ? (
            <Group gap={6} wrap={"nowrap"}>
              <IconCheck size={14} color={"#3dd68c"} aria-hidden />
              <Text fz={12} lh={"normal"} className={"text-[#adadad]"}>
                {t("supporter.perks.saved")}
              </Text>
            </Group>
          ) : null
        ) : undefined
      }
      className={className}
    >
      <Box className={"@container w-full"}>
        <Box
          data-testid={"supporter-perks-settings"}
          className={
            "grid grid-cols-1 gap-5 @[600px]:grid-cols-[minmax(0,1fr)_280px]"
          }
        >
          <Stack gap={16}>
            {isUnavailable && (
              <SettingsCard
                withDividers={false}
                role={"alert"}
                className={"border-[rgba(229,72,77,0.4)]"}
              >
                <Group gap={16} wrap={"nowrap"} align={"flex-start"} p={"md"}>
                  <Box
                    aria-hidden
                    className={
                      "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(229,72,77,0.12)]"
                    }
                  >
                    <IconAlertTriangle
                      size={18}
                      className={"text-[#ff6369]"}
                    />
                  </Box>
                  <Stack gap={8} className={"min-w-0 flex-1"}>
                    <Text fz={14} fw={600} c={"white"} lh={"normal"}>
                      {t("supporter.perks.errors.missing")}
                    </Text>
                    {onRetry && (
                      <Box>
                        <SettingsButton
                          variant={"secondary"}
                          size={"compact-sm"}
                          onClick={onRetry}
                        >
                          {t("supporter.perks.errors.retry")}
                        </SettingsButton>
                      </Box>
                    )}
                  </Stack>
                </Group>
              </SettingsCard>
            )}

            <SettingsCard>
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconBrush} />}
                title={t("supporter.perks.theme.title")}
                description={t("supporter.perks.theme.description")}
                rightSection={
                  <PerkSwitch
                    checked={values.showSupporterTheme}
                    locked={isLocked}
                    disabled={isUnavailable}
                    aria-label={switchLabel(t("supporter.perks.theme.title"))}
                    onChange={(checked) =>
                      update({ showSupporterTheme: checked })
                    }
                  />
                }
              />
              {!isLocked && (
                <SettingsRow
                  leftSection={<PerkIconTile Icon={IconPalette} />}
                  title={t("supporter.perks.accent.title")}
                  description={t("supporter.perks.accent.description")}
                  stackRightSection
                  rightSection={
                    <SupporterAccentPicker
                      accentColor={values.accentColor}
                      onChange={(value) => update({ accentColor: value })}
                      disabled={isUnavailable}
                    />
                  }
                />
              )}
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconCrown} />}
                title={t("supporter.perks.badge.title")}
                description={t("supporter.perks.badge.description")}
                rightSection={
                  <PerkSwitch
                    checked={values.showBadge}
                    locked={isLocked}
                    disabled={isUnavailable}
                    aria-label={switchLabel(t("supporter.perks.badge.title"))}
                    onChange={(checked) => update({ showBadge: checked })}
                  />
                }
              />
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconTag} />}
                title={t("supporter.perks.titleSelect.title")}
                description={t("supporter.perks.titleSelect.description")}
                stackRightSection
                rightSection={
                  isLocked ? (
                    <Group gap={8} wrap={"nowrap"}>
                      <IconLock
                        data-testid={"supporter-perk-lock"}
                        size={14}
                        color={"#adadad"}
                        aria-hidden
                      />
                      <Select
                        aria-label={switchLabel(
                          t("supporter.perks.titleSelect.title"),
                        )}
                        data={titleOptions}
                        value={""}
                        allowDeselect={false}
                        disabled
                        w={200}
                      />
                    </Group>
                  ) : (
                    <Select
                      aria-label={t("supporter.perks.titleSelect.title")}
                      data={titleOptions}
                      value={values.titleKey ?? ""}
                      allowDeselect={false}
                      disabled={isUnavailable}
                      onChange={(value) =>
                        update({ titleKey: value ? value : null })
                      }
                      w={200}
                    />
                  )
                }
              />
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconCircleDashed} />}
                title={t("supporter.perks.border.title")}
                description={t("supporter.perks.border.description")}
                rightSection={
                  <PerkSwitch
                    checked={values.showAnimatedAvatarBorder}
                    locked={isLocked}
                    disabled={isUnavailable}
                    aria-label={switchLabel(t("supporter.perks.border.title"))}
                    onChange={(checked) =>
                      update({ showAnimatedAvatarBorder: checked })
                    }
                  />
                }
              />
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconHeart} />}
                title={t("supporter.perks.wall.title")}
                description={
                  <>
                    {t("supporter.perks.wall.description")}
                    {!withSupportersWall && (
                      <>
                        {" "}
                        <Link
                          href={"/about#supporters"}
                          className={
                            "text-[#c7a6ff] underline hover:text-white"
                          }
                        >
                          {t("supporter.perks.wall.seeWall")}
                        </Link>
                      </>
                    )}
                  </>
                }
                rightSection={
                  <PerkSwitch
                    checked={values.showOnSupportersWall}
                    locked={isLocked}
                    disabled={isUnavailable}
                    aria-label={switchLabel(t("supporter.perks.wall.title"))}
                    onChange={(checked) =>
                      update({ showOnSupportersWall: checked })
                    }
                  />
                }
              />
              <SettingsRow
                leftSection={<PerkIconTile Icon={IconBroadcast} />}
                title={t("supporter.perks.live.title")}
                description={
                  mode === "edit" ? (
                    <LiveProfileDescription />
                  ) : (
                    t("supporter.perks.live.description")
                  )
                }
                rightSection={
                  <PerkSwitch
                    checked={values.showLiveProfile}
                    locked={isLocked}
                    disabled={isUnavailable}
                    aria-label={switchLabel(t("supporter.perks.live.title"))}
                    onChange={(checked) =>
                      update({ showLiveProfile: checked })
                    }
                  />
                }
              />
            </SettingsCard>

            {isLocked && (
              <Text fz={12} lh={"18px"} className={"text-[#adadad]"}>
                {t("supporter.perks.locked.note")}
              </Text>
            )}

            <Stack gap={8}>
              <Text fz={13} fw={600} lh={"normal"} className={"text-[#adadad]"}>
                {t("supporter.perks.groups.library")}
              </Text>
              <SettingsCard>
                <SettingsRow
                  leftSection={<PerkIconTile Icon={IconStack2} />}
                  title={t("supporter.perks.collections.title")}
                  description={t("supporter.features.collectionLimit.description")}
                  rightSection={
                    isLocked ? (
                      <SettingsPill tone={"premium"}>
                        {t("supporter.features.availableLabel")}
                      </SettingsPill>
                    ) : (
                      <SettingsPill tone={"success"}>
                        {t("supporter.perks.included")}
                      </SettingsPill>
                    )
                  }
                />
                <SettingsRow
                  leftSection={<PerkIconTile Icon={IconPhoto} />}
                  title={t("supporter.perks.customCovers.title")}
                  description={t("supporter.perks.customCovers.description")}
                  rightSection={<SettingsComingSoonBadge />}
                />
              </SettingsCard>
            </Stack>
          </Stack>

          <SupporterProfilePreview
            perks={perks}
            caption={caption}
            onWall={onWall}
            supporterSince={supporterSince}
          />
        </Box>
      </Box>
    </SettingsSection>
  );
}
