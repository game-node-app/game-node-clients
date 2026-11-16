import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { cn } from "#@/util";
import {
  Box,
  Group,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { AwardsGameCover } from "./AwardsGameCover";

export type AwardsCategoryRowState = "active" | "voted" | "pending";

export interface AwardsCategoryListRow {
  id: number;
  /** Localized text; callers resolve it with `useAwardsCategoryText`. */
  name: string;
  state: AwardsCategoryRowState;
  /** Cover of the voted/picked game, shown on a voted row. */
  game?: TGameOrSearchGame | null;
  /** Suggested game name, shown on the personal GOTY row before voting. */
  suggestionGameName?: string | null;
  /** Overrides the default state copy (e.g. a pick count in nominations). */
  statusLabel?: string | null;
}

export interface AwardsCategoryListProps {
  categories: AwardsCategoryListRow[];
  onSelect: (categoryId: number) => void;
  /** Heading, e.g. "Sua cédula". Omitted in the mobile categories modal. */
  title?: string;
  /** Progress numerator, shown beside `title`. */
  current?: number;
  /** Progress denominator, shown beside `title`. */
  total?: number;
  className?: string;
}

/** Zero-padded display number ("01"). */
export function formatCategoryNumber(position: number): string {
  return String(position).padStart(2, "0");
}

/**
 * Category rows from the design component `5408:731`: active ("Escolhendo"),
 * voted (cover + check) and pending ("Votar"). Shared by the ballot and the
 * nominations screen.
 */
const AwardsCategoryList = ({
  categories,
  onSelect,
  title,
  current,
  total,
  className,
}: AwardsCategoryListProps) => {
  const { t } = useTranslation();

  const showProgress = current != null && total != null;

  return (
    <Stack
      data-awards-category-list
      className={cn("w-full", className)}
      gap={"sm"}
    >
      {title && (
        <Group justify={"space-between"} align={"baseline"}>
          <Text fw={600}>{title}</Text>
          {showProgress && (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.shared.progress", { current, total })}
            </Text>
          )}
        </Group>
      )}
      {showProgress && (
        <Progress
          data-awards-progress-bar
          aria-label={t("awards.shared.progress", { current, total })}
          value={total > 0 ? (current / total) * 100 : 0}
          size={"xs"}
          radius={"xl"}
        />
      )}
      {categories.map((category, index) => {
        const statusLabel =
          category.statusLabel ??
          (category.state === "voted"
            ? t("awards.shared.rowStates.voted")
            : category.state === "active"
              ? t("awards.shared.rowStates.choosing")
              : t("awards.shared.rowStates.vote"));

        return (
          <UnstyledButton
            key={category.id}
            data-awards-category-row
            data-state={category.state}
            aria-current={category.state === "active" ? "step" : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              "w-full rounded-md border p-2 text-left transition-colors",
              category.state === "active"
                ? "border-brand bg-paper-2"
                : "border-paper-4 bg-paper-3 hover:bg-paper-2",
            )}
          >
            <Group justify={"space-between"} wrap={"nowrap"} gap={"sm"}>
              <Group wrap={"nowrap"} gap={"sm"} className={"min-w-0"}>
                <Text size={"xs"} c={"dimmed"} className={"w-5 shrink-0"}>
                  {formatCategoryNumber(index + 1)}
                </Text>
                {category.game && (
                  <Box
                    data-awards-row-cover
                    className={"w-8 shrink-0 overflow-hidden rounded-sm"}
                  >
                    <AwardsGameCover game={category.game} />
                  </Box>
                )}
                <Stack gap={0} className={"min-w-0"}>
                  <Text
                    size={"sm"}
                    fw={category.state === "active" ? 600 : 400}
                  >
                    {category.name}
                  </Text>
                  {category.suggestionGameName && (
                    <Text size={"xs"} c={"dimmed"} className={"truncate"}>
                      {t("awards.shared.rowStates.suggested", {
                        game: category.suggestionGameName,
                      })}
                    </Text>
                  )}
                </Stack>
              </Group>
              <Group gap={4} wrap={"nowrap"} className={"shrink-0"}>
                {category.state === "voted" && (
                  <IconCircleCheckFilled
                    data-awards-row-check
                    size={16}
                    className={"text-teal-400"}
                  />
                )}
                <Text
                  size={"xs"}
                  c={category.state === "pending" ? "dimmed" : undefined}
                >
                  {statusLabel}
                </Text>
              </Group>
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
};

export { AwardsCategoryList };
