import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconEyeOff, IconLock } from "@tabler/icons-react";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";
import { cn } from "#@/util/cn";

interface Props {
  keywords: string[];
  imageTokens: string[];
  attempts: number;
  maxAttempts: number;
}

/** A slight, stable tilt per note, so the board reads as pinned paper. */
const TILTS = [2, -1.5, 1, -2, 1.5, -1];

/**
 * The clues as notes on a board; each wrong guess pins a new one, highlighted.
 */
const DailyKeywordsHint = ({
  keywords,
  imageTokens,
  attempts,
  maxAttempts,
}: Props) => {
  const { t } = useTranslation();
  // The server shows one more clue per attempt until the last one.
  const remaining = Math.max(maxAttempts - 1 - attempts, 0);

  return (
    <Stack className={"w-full gap-2.5"}>
      <div
        className={
          "w-full rounded-[12px] border border-[var(--mantine-color-default-border)] bg-[#15130f] bg-[radial-gradient(#2e2a22_1px,transparent_1px)] bg-[length:24px_24px] p-5"
        }
      >
        <div className={"grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3"}>
          {keywords.map((keyword, index) => {
            const isNew = attempts > 0 && index === keywords.length - 1;
            return (
              <div
                key={keyword}
                className={cn(
                  "flex flex-col gap-1.5 rounded px-4 py-3.5 shadow-md",
                  isNew ? "bg-[#f6d9c9]" : "bg-[#e9e3d4]",
                )}
                style={{
                  transform: `rotate(${TILTS[index % TILTS.length]}deg)`,
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 rounded-full",
                    isNew ? "bg-brand-5" : "bg-[#6b6458]",
                  )}
                />
                <Text fz={18} fw={700} lh={1.2} c={"#1a1714"}>
                  {keyword}
                </Text>
                <Text fz={11} fw={500} c={isNew ? "#a8381a" : "#6b6458"}>
                  {isNew
                    ? t("daily.keywords.newClue", { attempt: attempts })
                    : t("daily.keywords.clue", { number: index + 1 })}
                </Text>
              </div>
            );
          })}
        </div>
        {remaining > 0 && (
          <Group className={"mt-5 gap-1.5"}>
            <IconLock size={14} className={"text-[#8a8478]"} />
            <Text fz={12} fw={500} c={"#8a8478"}>
              {t("daily.keywords.locked", { count: remaining })}
            </Text>
          </Group>
        )}
      </div>
      <Group className={"justify-center gap-1.5"}>
        <IconEyeOff size={14} className={"text-dimmed"} />
        <Text fz={12} c={"dimmed"}>
          {t("daily.keywords.filtered")}
        </Text>
      </Group>
      {/* The cover joins the clues on the last attempt. */}
      {imageTokens.length > 0 && (
        <DailyImageHint
          key={imageTokens.length}
          tokens={imageTokens}
          levels={imageTokens.length}
          maskTitle
        />
      )}
    </Stack>
  );
};

export { DailyKeywordsHint };
