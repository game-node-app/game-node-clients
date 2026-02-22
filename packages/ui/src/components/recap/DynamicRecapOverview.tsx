import React, { useMemo } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { RecapYearTitle, useRecapStatus, useUserId } from "#@/components";
import { Link } from "#@/util";
import dayjs from "dayjs";

const DynamicRecapOverview = () => {
  const userId = useUserId();
  const targetYear = useMemo(() => {
    const now = dayjs();
    if (now.month() < 11) {
      return now.year() - 1;
    }

    return now.year();
  }, []);

  const { data: recapStatus } = useRecapStatus(userId, targetYear);

  if (
    !userId ||
    !recapStatus ||
    (!recapStatus.isRecapCreated && !recapStatus.isRecapEligible)
  ) {
    return null;
  }

  return (
    <Stack className={"w-full items-center"}>
      <RecapYearTitle userId={userId} targetYear={targetYear} />
      <Text className={"font-bold text-2xl text-center max-w-2xl"}>
        Discover your 2025 highlights: hours played, favorite games, collections
        created, and epic achievements.
      </Text>
      <Stack>
        {recapStatus.isRecapCreated ? (
          <Link href={`/recap/${targetYear}/${userId}`}>
            <Button size={"xl"} className={"lg:w-80 rounded-md"}>
              Create my Recap
            </Button>
          </Link>
        ) : (
          <>
            <Button size={"xl"} className={"lg:w-80 rounded-md"} disabled>
              Available Soon
            </Button>
            <Text className={"text-dimmed text-center text-sm"}>
              Your recap is being generated. Check back tomorrow!
            </Text>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export { DynamicRecapOverview };
