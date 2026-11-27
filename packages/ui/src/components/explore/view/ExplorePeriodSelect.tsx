import { Button, Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

export interface ExplorePeriodSelectProps {
  value: StatisticsRankingsRequestDto.period;
  options: { label: string; value: StatisticsRankingsRequestDto.period }[];
  onChange: (period: StatisticsRankingsRequestDto.period) => void;
}

/**
 * Period picker of the Explore screen, a pill next to the genre chips. Mobile
 * replaces it with the native action sheet.
 */
const ExplorePeriodSelect = ({
  value,
  options,
  onChange,
}: ExplorePeriodSelectProps) => {
  const { t } = useTranslation();
  const label = options.find((option) => option.value === value)?.label;

  return (
    <Menu position={"bottom-start"} width={200}>
      <Menu.Target>
        <Button
          variant={"default"}
          radius={"xl"}
          size={"compact-md"}
          className={"shrink-0"}
          rightSection={<IconChevronDown size={16} aria-hidden />}
          aria-label={`${t("explore.filters.trendingIn")}: ${label}`}
        >
          {label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("explore.filters.trendingIn")}</Menu.Label>
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            aria-current={option.value === value}
            rightSection={
              option.value === value && <IconCheck size={16} aria-hidden />
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export { ExplorePeriodSelect };
