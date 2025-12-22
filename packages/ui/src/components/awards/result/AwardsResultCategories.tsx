import React from "react";
import { AwardsResultCategory, useAwardCategoryResults } from "#@/components";
import { Stack, Text } from "@mantine/core";

interface Props {
  eventId: number;
}

const AwardsResultCategories = ({ eventId }: Props) => {
  const categoryResultsQuery = useAwardCategoryResults(eventId);

  const results = categoryResultsQuery.data || [];

  return (
    <Stack>
      <Text className={"block md:hidden text-sm text-dimmed mb-2"}>
        Tip: tap on a game to see the voting percentage.
      </Text>
      {results.map((result) => (
        <AwardsResultCategory key={result.id} result={result} />
      ))}
    </Stack>
  );
};

export { AwardsResultCategories };
