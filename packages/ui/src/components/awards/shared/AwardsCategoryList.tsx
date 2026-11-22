import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { cn } from "#@/util";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";
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
  const progressLabel = showProgress
    ? t("awards.shared.progress", { current, total })
    : undefined;

  return (
    <Stack
      data-awards-category-list
      className={cn("w-full", className)}
      gap={6}
    >
      {title && (
        <Stack gap={10} className={"px-1 pb-3.5"}>
          <Group justify={"space-between"} align={"center"} wrap={"nowrap"}>
            <Text className={"text-[20px] font-semibold leading-[normal]"}>
              {title}
            </Text>
            {progressLabel && (
              <Text
                className={
                  "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
                }
              >
                {progressLabel}
              </Text>
            )}
          </Group>
          {showProgress && (
            <Box
              data-awards-progress-bar
              role={"progressbar"}
              aria-label={progressLabel}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={current}
              className={
                "h-1.5 w-full overflow-hidden rounded-[3px] bg-paper-1"
              }
            >
              <Box
                className={"h-full rounded-[3px] bg-brand"}
                style={{
                  width: `${total > 0 ? Math.min(100, (current / total) * 100) : 0}%`,
                }}
              />
            </Box>
          )}
        </Stack>
      )}
      {categories.map((category, index) => {
        const isActive = category.state === "active";
        const isVoted = category.state === "voted";
        const statusLabel =
          category.statusLabel ??
          (isVoted
            ? t("awards.shared.rowStates.voted")
            : isActive
              ? t("awards.shared.rowStates.choosing")
              : t("awards.shared.rowStates.vote"));
        const suggestion = category.suggestionGameName
          ? t("awards.shared.rowStates.suggested", {
              game: category.suggestionGameName,
            })
          : null;

        return (
          <UnstyledButton
            key={category.id}
            data-awards-category-row
            data-state={category.state}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex h-14 w-full items-center gap-3 rounded-[10px] border pl-[14px] pr-3 text-left transition-colors",
              isActive
                ? "border-line-strong bg-paper-1"
                : "border-transparent hover:bg-paper-3",
            )}
          >
            <Text
              className={cn(
                "w-5 shrink-0 text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px]",
                isActive ? "text-brand" : "text-dimmed-1",
              )}
            >
              {formatCategoryNumber(index + 1)}
            </Text>
            <Text
              className={cn(
                "min-w-0 flex-1 truncate text-[16px] font-medium leading-normal text-foreground",
                suggestion && !isVoted && "shrink-0 flex-none max-w-[62%]",
              )}
            >
              {category.name}
            </Text>
            {isVoted && category.game && (
              <Box
                data-awards-row-cover
                className={"h-8 w-6 shrink-0 overflow-hidden rounded-[4px]"}
              >
                <AwardsGameCover
                  game={category.game}
                  className={"h-full"}
                  imageProps={{ radius: 4 }}
                />
              </Box>
            )}
            {isVoted ? (
              <>
                <IconCheck
                  data-awards-row-check
                  size={18}
                  stroke={2.5}
                  className={"shrink-0 text-state-played"}
                  aria-hidden={"true"}
                />
                <span className={"sr-only"}>{statusLabel}</span>
              </>
            ) : suggestion ? (
              <Text
                className={
                  "min-w-0 flex-1 truncate text-right text-[14px] leading-[1.43] text-dimmed-1"
                }
              >
                {suggestion}
              </Text>
            ) : (
              <Text
                className={cn(
                  "shrink-0 text-[14px] leading-[1.43]",
                  isActive ? "text-brand-3" : "text-dimmed-1",
                )}
              >
                {statusLabel}
              </Text>
            )}
          </UnstyledButton>
        );
      })}
    </Stack>
  );
};

export { AwardsCategoryList };
