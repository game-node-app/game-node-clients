import { useTranslation } from "@repo/locales";
import { Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { FeatItem } from "../util/feats";
import { FeatCard } from "./FeatCard";

export type FeatsSectionKind = "obtained" | "notObtained";

export interface FeatsSectionProps {
  kind: FeatsSectionKind;
  /** Feats that matched the active filters, already split by state. */
  items: readonly FeatItem[];
  onOpenTiers: (item: FeatItem) => void;
  /** Renders the empty state when `items` is empty instead of hiding the section. */
  showEmptyState?: boolean;
}

/**
 * Grid section of the Feats page: "Obtidas" or "Ainda não obtidas", with the
 * matching count (and secret count) in the header. Sections without feats are
 * hidden unless they must show the "no feats found" empty state.
 */
const FeatsSection = ({
  kind,
  items,
  onOpenTiers,
  showEmptyState = false,
}: FeatsSectionProps) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    if (!showEmptyState) return null;

    return (
      <Stack
        align={"center"}
        gap={4}
        className={
          "rounded-2xl border border-dashed border-paper-4 bg-paper-7 px-6 py-10 text-center"
        }
      >
        <IconSearch size={28} className={"text-faint"} />
        <Text fz={16} fw={600} className={"text-foreground"}>
          {t("achievements.filters.empty")}
        </Text>
        <Text fz={13} className={"text-soft"}>
          {t("achievements.filters.emptyDescription")}
        </Text>
      </Stack>
    );
  }

  const obtained = kind === "obtained";
  const secretCount = obtained
    ? 0
    : items.filter((item) => item.state === "secret").length;

  const countLabel =
    secretCount > 0
      ? t("achievements.sections.notObtainedCountWithSecrets", {
          count: items.length,
          secrets: t("achievements.sections.secretCount", {
            count: secretCount,
          }),
        })
      : obtained
        ? t("achievements.sections.obtainedCount", { count: items.length })
        : t("achievements.sections.notObtainedCount", {
            count: items.length,
          });

  return (
    <Stack gap={16}>
      <Group gap={10} align={"baseline"} wrap={"nowrap"}>
        <Title order={3} fz={18} fw={600} className={"text-foreground"}>
          {t(
            obtained
              ? "achievements.sections.obtained"
              : "achievements.sections.notObtained",
          )}
        </Title>
        <Text fz={13} lh={"normal"} className={"text-faint"}>
          {countLabel}
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={12}>
        {items.map((item) => (
          <FeatCard
            key={item.achievement.id}
            item={item}
            onOpenTiers={onOpenTiers}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export { FeatsSection };
