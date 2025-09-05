import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { AwardsDetailView } from "@/components/awards/AwardsDetailView.tsx";
import { useRouter } from "next/router";

const AwardsEventDetailPage = () => {
  const router = useRouter();
  const { eventId } = router.query;

  return (
    <PageContainer title={"Awards event detail"}>
      <AwardsDetailView eventId={Number.parseInt(eventId as string)} />
    </PageContainer>
  );
};

export default AwardsEventDetailPage;
