import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { AwardsView } from "@/components/awards/AwardsView.tsx";

const AwardsPage = () => {
  return (
    <PageContainer title={"Awards"}>
      <AwardsView />
    </PageContainer>
  );
};

export default AwardsPage;
