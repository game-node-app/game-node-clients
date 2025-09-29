import React from "react";
import { useAwardEventCategories } from "#@/components";
import { SimpleGrid, SimpleGridProps } from "@mantine/core";
import { AwardsEventCategory } from "#@/components/awards/category/AwardsEventCategory.tsx";

interface Props {
  eventId: number;
  userId: string;
  isVotingPermitted?: boolean;
  cols?: SimpleGridProps["cols"];
}

const AwardsEventCategoriesList = ({
  eventId,
  userId,
  isVotingPermitted = false,
  cols,
}: Props) => {
  const { data: categories } = useAwardEventCategories(eventId);

  const colsValue = cols ?? {
    base: 2,
    lg: 5,
  };

  return (
    <SimpleGrid cols={colsValue} className={"@container px-2 @lg:px-12 py-6"}>
      {categories?.map((category) => {
        return (
          <AwardsEventCategory
            key={category.id}
            userId={userId}
            category={category}
            isVotingPermitted={isVotingPermitted}
          />
        );
      })}
    </SimpleGrid>
  );
};

export { AwardsEventCategoriesList };
