import React from "react";
import { useAwardEventCategories } from "#@/components";
import { SimpleGrid } from "@mantine/core";
import { AwardsEventCategory } from "#@/components/awards/category/AwardsEventCategory.tsx";

interface Props {
  eventId: number;
  userId: string;
}

const AwardsEventCategoriesList = ({ eventId, userId }: Props) => {
  const { data: categories } = useAwardEventCategories(eventId);

  return (
    <SimpleGrid
      cols={{
        base: 2,
        lg: 5,
      }}
      className={"px-2 lg:px-12 py-6"}
    >
      {categories?.map((category) => {
        return (
          <AwardsEventCategory
            key={category.id}
            userId={userId}
            category={category}
          />
        );
      })}
    </SimpleGrid>
  );
};

export { AwardsEventCategoriesList };
