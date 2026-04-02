import React, { useMemo } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { RecapYearTitle, useRecapStatus, useUserId } from "#@/components";
import { Link } from "#@/util";
import dayjs from "dayjs";
import { useTranslation } from "@repo/locales";

const DynamicRecapOverview = () => {
  const { t } = useTranslation();
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
        {t("recap.overview.description", { year: targetYear })}
      </Text>
      <Stack>
        {recapStatus.isRecapCreated ? (
          <Link href={`/recap/${targetYear}/${userId}`}>
            <Button size={"xl"} className={"lg:w-80 rounded-md"}>
              {t("recap.buttons.create")}
            </Button>
          </Link>
        ) : (
          <>
            <Button size={"xl"} className={"lg:w-80 rounded-md"} disabled>
              {t("recap.buttons.availableSoon")}
            </Button>
            <Text className={"text-dimmed text-center text-sm"}>
              {t("recap.messages.generating")}
            </Text>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export { DynamicRecapOverview };
