import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconInfoCircle,
  IconProps,
} from "@tabler/icons-react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { cn } from "#@/util";

export type SupporterSettingsBannerTone =
  | "success"
  | "pending"
  | "cancel"
  | "error";

export interface SupporterSettingsBannerProps {
  tone: SupporterSettingsBannerTone;
  /** Overrides the copy for the tone (e.g. a mapped billing error). */
  title?: ReactNode;
  description?: ReactNode;
  /**
   * Pending only: refetches the subscription status while activation is
   * unconfirmed. The banner polls every 4s for at most 60s.
   */
  onCheckAgain?: () => void;
  /** Whether the manual check is currently in flight. */
  isChecking?: boolean;
  className?: string;
}

const CHECKOUT_POLL_INTERVAL_MS = 4_000;
const CHECKOUT_POLL_TIMEOUT_MS = 60_000;

interface ToneConfig {
  role: "status" | "alert";
  Icon: ComponentType<IconProps>;
  cardClassName: string;
  iconTileClassName: string;
  iconClassName: string;
  titleKey:
    | "supporter.checkout.success.title"
    | "supporter.checkout.pending.title"
    | "supporter.checkout.cancel.title"
    | "supporter.banner.errorTitle";
  descriptionKey:
    | "supporter.checkout.success.description"
    | "supporter.checkout.pending.description"
    | "supporter.checkout.cancel.description"
    | "supporter.errors.generic";
}

const TONE_CONFIG: Record<SupporterSettingsBannerTone, ToneConfig> = {
  success: {
    role: "status",
    Icon: IconCircleCheck,
    cardClassName: "border-[rgba(61,214,140,0.4)]",
    iconTileClassName: "bg-[rgba(61,214,140,0.12)]",
    iconClassName: "text-[#3dd68c]",
    titleKey: "supporter.checkout.success.title",
    descriptionKey: "supporter.checkout.success.description",
  },
  pending: {
    role: "status",
    Icon: IconClock,
    cardClassName: "border-[rgba(151,71,255,0.45)]",
    iconTileClassName: "bg-[rgba(151,71,255,0.16)]",
    iconClassName: "text-[#c7a6ff]",
    titleKey: "supporter.checkout.pending.title",
    descriptionKey: "supporter.checkout.pending.description",
  },
  cancel: {
    role: "status",
    Icon: IconInfoCircle,
    cardClassName: "border-[#2a2a2a]",
    iconTileClassName: "bg-[#222]",
    iconClassName: "text-[#adadad]",
    titleKey: "supporter.checkout.cancel.title",
    descriptionKey: "supporter.checkout.cancel.description",
  },
  error: {
    role: "alert",
    Icon: IconAlertTriangle,
    cardClassName: "border-[rgba(229,72,77,0.4)]",
    iconTileClassName: "bg-[rgba(229,72,77,0.12)]",
    iconClassName: "text-[#ff6369]",
    titleKey: "supporter.banner.errorTitle",
    descriptionKey: "supporter.errors.generic",
  },
};

/**
 * Bounded activation polling. Mounted only by the pending banner so leaving
 * the checkout result (or a confirmed status) resets the window.
 */
function SupporterPendingCheck({
  onCheckAgain,
  isChecking,
}: {
  onCheckAgain: () => void;
  isChecking?: boolean;
}) {
  const { t } = useTranslation();
  const [hasExpired, setHasExpired] = useState(false);
  // Parents may pass an inline function; keep the latest one without
  // restarting the polling window on every render.
  const onCheckAgainRef = useRef(onCheckAgain);

  useEffect(() => {
    onCheckAgainRef.current = onCheckAgain;
  }, [onCheckAgain]);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt >= CHECKOUT_POLL_TIMEOUT_MS) {
        setHasExpired(true);
        clearInterval(timer);
        return;
      }

      onCheckAgainRef.current();
    }, CHECKOUT_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  if (!hasExpired) return null;

  return (
    <Stack gap={8}>
      <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
        {t("supporter.checkout.pending.stillConfirming")}
      </Text>
      <Box>
        <SettingsButton
          variant={"secondary"}
          onClick={onCheckAgain}
          loading={isChecking}
          disabled={isChecking}
        >
          {t("supporter.checkout.pending.refresh")}
        </SettingsButton>
      </Box>
    </Stack>
  );
}

/** Settings-styled result banner (success, pending, cancel or action error). */
export function SupporterSettingsBanner({
  tone,
  title,
  description,
  onCheckAgain,
  isChecking = false,
  className,
}: SupporterSettingsBannerProps) {
  const { t } = useTranslation();
  const config = TONE_CONFIG[tone];
  const { Icon } = config;

  return (
    <SettingsCard
      withDividers={false}
      role={config.role}
      data-testid={`supporter-settings-banner-${tone}`}
      className={cn("border", config.cardClassName, className)}
    >
      <Group gap={16} wrap={"nowrap"} align={"flex-start"} p={"md"}>
        <Box
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
            config.iconTileClassName,
          )}
        >
          <Icon size={18} className={config.iconClassName} />
        </Box>
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text fz={14} fw={600} c={"white"} lh={"normal"}>
            {title ?? t(config.titleKey)}
          </Text>
          <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
            {description ?? t(config.descriptionKey)}
          </Text>
          {tone === "pending" && onCheckAgain && (
            <SupporterPendingCheck
              onCheckAgain={onCheckAgain}
              isChecking={isChecking}
            />
          )}
        </Stack>
      </Group>
    </SettingsCard>
  );
}
