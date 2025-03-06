import React, { useMemo } from "react";
import dayjs from "dayjs";
// Imports the extended DayJS interface
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import "dayjs/plugin/relativeTime";
import { Text, TextProps } from "@mantine/core";

interface Props extends TextProps {
  date: string;
  /**
   * If returned date should always be relative
   */
  force?: boolean;
}

/**
 * Component that renders a date relative to today - if less than 24 hours ago
 * and localized date otherwise.
 * @constructor
 */
const RelativeDate = ({ date, force = false, ...others }: Props) => {
  const parsedDate = useMemo(() => {
    const actualDate = dayjs(date);

    const yesterday = dayjs().subtract(1, "day");

    if (!force && actualDate.isBefore(yesterday)) {
      return actualDate.format("DD/MM/YYYY HH:ss");
    }

    return actualDate.fromNow();
  }, [date, force]);

  return <Text {...others}>{parsedDate}</Text>;
};

export { RelativeDate };
