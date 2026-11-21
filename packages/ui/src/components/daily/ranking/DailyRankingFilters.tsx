import type { ReactNode } from "react";
import { useTranslation } from "@repo/locales";
import { IconTrophy, IconUsers } from "@tabler/icons-react";
import {
  DAILY_RANKING_PERIODS,
  type DailyRankingQuery as Filters,
  type DailyRankingPeriod,
} from "#@/components/daily/ranking/useInfiniteDailyRanking";
import {
  DAILY_MODE_ICONS,
  DAILY_MODES,
  type DailyMode,
} from "#@/components/daily/util/dailyModes";
import { cn } from "#@/util/cn";

/** Mobile frame order: the default period first. */
const CHIP_PERIODS: DailyRankingPeriod[] = ["week", "today", "month", "all"];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** "People I follow" needs a session. */
  signedIn: boolean;
}

interface Option {
  key: string;
  label: string;
  icon?: ReactNode;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const SegmentGroup = ({
  label,
  options,
  variant,
  dimmed,
}: {
  label: string;
  options: Option[];
  variant: "accent" | "raised";
  dimmed?: boolean;
}) => (
  <div
    role={"group"}
    aria-label={label}
    className={cn(
      "flex gap-0.5 rounded-[10px] border border-solid border-line bg-paper-8 p-1",
      dimmed && "opacity-50",
    )}
  >
    {options.map((option) => (
      <button
        key={option.key}
        type={"button"}
        aria-pressed={option.active}
        disabled={option.disabled}
        onClick={option.onSelect}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-solid py-2 font-[inherit] transition-colors disabled:cursor-not-allowed",
          variant === "accent"
            ? "px-3.5 text-[14px] font-semibold"
            : "px-3 text-[13px]",
          option.active
            ? variant === "accent"
              ? "border-transparent bg-brand-5 text-accent-contrast"
              : "border-line bg-nav-raised font-semibold text-white"
            : "border-transparent bg-transparent text-dimmed-2 hover:text-white",
          variant === "raised" && !option.active && "font-medium",
        )}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);

const ChipRow = ({ label, options }: { label: string; options: Option[] }) => (
  <div
    role={"group"}
    aria-label={label}
    className={
      "-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    }
  >
    {options.map((option) => (
      <button
        key={option.key}
        type={"button"}
        aria-pressed={option.active}
        disabled={option.disabled}
        onClick={option.onSelect}
        className={cn(
          "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-solid px-3 py-2 font-[inherit] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50",
          option.active
            ? "border-brand-5 bg-brand-5 text-accent-contrast"
            : "border-line bg-paper-8 text-dimmed-2",
        )}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * Mode, period and scope: segmented groups when the page is wide, scrolling chips otherwise.
 */
const DailyRankingFilters = ({ filters, onChange, signedIn }: Props) => {
  const { t } = useTranslation();
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const modeOptions = (iconSize: number): Option[] => [
    {
      key: "overall",
      label: t("daily.ranking.overall"),
      icon: <IconTrophy size={iconSize} aria-hidden />,
      active: filters.mode === null,
      onSelect: () => set({ mode: null }),
    },
    ...DAILY_MODES.map((mode: DailyMode) => {
      const Icon = DAILY_MODE_ICONS[mode];
      return {
        key: mode,
        label: t(`daily.modes.${mode}.name`),
        icon: <Icon size={iconSize} aria-hidden />,
        active: filters.mode === mode,
        onSelect: () => set({ mode }),
      };
    }),
  ];
  const periodOptions = (periods: DailyRankingPeriod[]): Option[] =>
    periods.map((period) => ({
      key: period,
      label: t(`daily.ranking.periods.${period}`),
      active: filters.period === period,
      onSelect: () => set({ period }),
    }));
  const scopeOptions: Option[] = (["all", "following"] as const).map(
    (scope) => ({
      key: scope,
      label: t(`daily.ranking.scopes.${scope}`),
      active: filters.scope === scope,
      disabled: scope === "following" && !signedIn,
      onSelect: () => set({ scope }),
    }),
  );
  const following = scopeOptions[1];

  return (
    <>
      <div
        className={
          "hidden flex-wrap items-center justify-between gap-3 @[900px]/page:flex"
        }
      >
        <SegmentGroup
          label={t("daily.ranking.filters.mode")}
          options={modeOptions(16)}
          variant={"accent"}
        />
        <div className={"flex flex-wrap gap-3"}>
          <SegmentGroup
            label={t("daily.ranking.filters.period")}
            options={periodOptions(DAILY_RANKING_PERIODS)}
            variant={"raised"}
          />
          <SegmentGroup
            label={t("daily.ranking.filters.scope")}
            options={scopeOptions}
            variant={"raised"}
            dimmed={!signedIn}
          />
        </div>
      </div>
      <div className={"flex flex-col gap-2.5 @[900px]/page:hidden"}>
        <ChipRow
          label={t("daily.ranking.filters.mode")}
          options={modeOptions(14)}
        />
        <ChipRow
          label={t("daily.ranking.filters.period")}
          options={[
            ...periodOptions(CHIP_PERIODS),
            {
              ...following,
              icon: <IconUsers size={14} aria-hidden />,
              // The chip toggles between everyone and people I follow.
              onSelect: () =>
                set({ scope: following.active ? "all" : "following" }),
            },
          ]}
        />
      </div>
    </>
  );
};

export { DailyRankingFilters };
