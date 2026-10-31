import React from "react";
import { useRouter } from "next/router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { DefinitionForm } from "@/components/achievement/catalog/DefinitionForm";

const Page = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  return (
    <PageContainer
      title={id === "new" ? "Create definition" : "Edit definition"}
      items={[
        {
          label: "Achievement definitions",
          href: "/dashboard/achievement/definitions",
        },
      ]}
    >
      {id && <DefinitionForm id={id} />}
    </PageContainer>
  );
};

export default Page;
