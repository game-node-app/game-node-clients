import { useTranslation } from "@repo/locales";
import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconTicket } from "@tabler/icons-react";
import type { ReactNode } from "react";
import {
  formatFeatNumber,
  type FeatItem,
  type FeatsSummary,
} from "../util/feats";
import { FeatsFeaturedSlot } from "./FeatsFeaturedSlot";

export interface FeatsSummaryCardProps {
  summary: FeatsSummary;
  /** First featured feat of the viewed user, when there is one. */
  featuredItem?: FeatItem | null;
  isOwner: boolean;
  onPickFeatured: () => void;
  onRedeem: () => void;
}

interface SummaryStatProps {
  value: ReactNode;
  label: string;
}

const SummaryStat = ({ value, label }: SummaryStatProps) => (
  <Stack gap={2} className={"min-w-0"}>
    <Text
      fz={22}
      fw={700}
      lh={"normal"}
      className={"text-foreground sm:text-[30px]"}
    >
      {value}
    </Text>
    <Text fz={12} lh={"normal"} className={"text-soft"}>
      {label}
    </Text>
  </Stack>
);

/**
 * Summary of the Feats page: obtained feats, conquered tiers and XP earned
 * from feats, followed by the featured feat slot and the redeem action.
 */
const FeatsSummaryCard = ({
  summary,
  featuredItem,
  isOwner,
  onPickFeatured,
  onRedeem,
}: FeatsSummaryCardProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;

  return (
    <Stack
      gap={20}
      className={
        "h-full rounded-2xl border border-paper-4 bg-paper-7 p-5 lg:p-6"
      }
    >
      <SimpleGrid cols={3} spacing={12}>
        <SummaryStat
          value={
            <>
              <span className={"text-[22px] sm:text-[30px]"}>
                {formatFeatNumber(summary.obtainedCount, locale)}
              </span>
              <span
                className={"text-[13px] font-medium sm:text-[16px] text-faint"}
              >
                {" / "}
                {formatFeatNumber(summary.total, locale)}
              </span>
            </>
          }
          label={t("achievements.summary.featsObtained")}
        />
        <SummaryStat
          value={formatFeatNumber(summary.tiersCount, locale)}
          label={t("achievements.summary.tiersConquered")}
        />
        <SummaryStat
          value={formatFeatNumber(summary.featXp, locale)}
          label={t("achievements.summary.featXp")}
        />
      </SimpleGrid>

      <FeatsFeaturedSlot
        item={featuredItem}
        isOwner={isOwner}
        onPickFeatured={onPickFeatured}
      />

      {isOwner && (
        <Button
          fullWidth
          leftSection={<IconTicket size={18} />}
          onClick={onRedeem}
          className={"font-bold"}
        >
          {t("achievements.summary.redeemCode")}
        </Button>
      )}
    </Stack>
  );
};

export { FeatsSummaryCard };
