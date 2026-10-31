import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { EventsView } from "@/components/achievement/catalog/EventsView";

const Page = () => {
  return (
    <PageContainer title={"Achievement events"}>
      <EventsView />
    </PageContainer>
  );
};

export default Page;
