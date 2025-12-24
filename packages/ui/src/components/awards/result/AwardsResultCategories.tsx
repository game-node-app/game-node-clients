import React, { useMemo } from "react";
import {
  AwardsResultCategory,
  useAwardCategoryResults,
  useAwardCategoryVote,
  useAwardEventCategories,
  useUserId,
} from "#@/components";
import { Stack, Text } from "@mantine/core";
import { AwardsCategoryResult } from "@repo/wrapper/server";

interface Props {
  eventId: number;
}

const AwardsResultCategories = ({ eventId }: Props) => {
  const categoryResultsQuery = useAwardCategoryResults(eventId);

  const results = categoryResultsQuery.data || [];

  const filteredResults = results.filter(
    (result) => result.winners.length > 0 && !result.category.isPersonalGOTY,
  );

  return (
    <Stack>
      <Text className={"block md:hidden text-sm text-dimmed mb-2"}>
        Tip: tap on a game to see the voting percentage.
      </Text>
      {filteredResults.map((result) => (
        <AwardsResultCategory key={result.id} result={result} />
      ))}
    </Stack>
  );
};

export { AwardsResultCategories };
