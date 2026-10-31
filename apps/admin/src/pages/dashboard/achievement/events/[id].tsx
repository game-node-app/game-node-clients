import React from "react";
import { useRouter } from "next/router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { EventForm } from "@/components/achievement/catalog/EventForm";

const Page = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  return (
    <PageContainer
      title={id === "new" ? "Create event" : "Edit event"}
      items={[
        { label: "Achievement events", href: "/dashboard/achievement/events" },
      ]}
    >
      {id && <EventForm id={id} />}
    </PageContainer>
  );
};

export default Page;
