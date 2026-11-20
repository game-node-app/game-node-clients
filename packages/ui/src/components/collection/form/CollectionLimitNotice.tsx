import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconStack2 } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { SettingsIconTile } from "#@/components/settings/common/SettingsRow";
import { useSupporterSettingsHref } from "#@/components/supporter/util/useSupporterSettingsHref";
import { Link } from "#@/util";

export interface CollectionLimitNoticeProps {
  /** Server-provided collection limit; `null` renders the no-count title. */
  limit: number | null;
  onNavigate?: () => void;
}

/**
 * Inline replacement for the generic error when the server refuses to create a
 * collection because a free account reached its limit (design D12).
 */
export function CollectionLimitNotice({
  limit,
  onNavigate,
}: CollectionLimitNoticeProps) {
  const { t } = useTranslation();
  const supporterSettingsHref = useSupporterSettingsHref();

  return (
    <Paper
      radius={"md"}
      p={"md"}
      data-testid={"collection-limit-notice"}
      style={{
        border:
          "1px solid color-mix(in srgb, var(--gn-premium) 45%, transparent)",
        background: "color-mix(in srgb, var(--gn-premium) 8%, transparent)",
      }}
    >
      <Group wrap={"nowrap"} align={"flex-start"} gap={12}>
        <SettingsIconTile
          Icon={IconStack2}
          className={"bg-premium/[0.16]"}
          iconClassName={"text-premium-text"}
        />
        <Stack gap={4}>
          <Text fw={600}>
            {limit == null
              ? t("collection.limit.titleNoCount")
              : t("collection.limit.title", { limit })}
          </Text>
          <Text fz={13} className={"text-dimmed-2"}>
            {t("collection.limit.description")}
          </Text>
          <Button
            component={Link}
            href={supporterSettingsHref}
            size={"xs"}
            color={"brand"}
            onClick={() => onNavigate?.()}
            className={"w-fit"}
          >
            {t("collection.limit.cta")}
          </Button>
        </Stack>
      </Group>
    </Paper>
  );
}
