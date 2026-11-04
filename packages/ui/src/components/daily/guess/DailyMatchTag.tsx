import { Badge, BadgeProps } from "@mantine/core";
import {
  DAILY_MATCH_KIND,
  DAILY_RESULT_STYLES,
} from "#@/components/daily/util/dailyModes";

export type DailyMatch = keyof typeof DAILY_MATCH_KIND;

interface Props extends BadgeProps {
  match: DailyMatch;
  label: string;
}

/**
 * A value colored by how it matches the answer: the franchise tag and the genre/theme/platform chips.
 */
const DailyMatchTag = ({ match, label, ...others }: Props) => {
  const { color, icon: MatchIcon } =
    DAILY_RESULT_STYLES[DAILY_MATCH_KIND[match]];

  return (
    <Badge
      variant={"light"}
      color={color}
      tt={"none"}
      leftSection={<MatchIcon size={12} />}
      {...others}
    >
      {label}
    </Badge>
  );
};

export { DailyMatchTag };
