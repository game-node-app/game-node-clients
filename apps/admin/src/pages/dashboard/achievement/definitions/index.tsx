import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { DefinitionsView } from "@/components/achievement/catalog/DefinitionsView";

const Page = () => {
  return (
    <PageContainer title={"Achievement definitions"}>
      <DefinitionsView />
    </PageContainer>
  );
};

export default Page;
