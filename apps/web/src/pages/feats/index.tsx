import React, { useEffect } from "react";
import { useUserId } from "@repo/ui";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SessionAuth } from "@repo/ui";

const FeatsIndexPage = () => {
  const userId = useUserId();
  const router = useRouter();
  useEffect(() => {
    if (router.isReady && userId) {
      router.replace(`/feats/${userId}`).then().catch();
    }
  }, [router, userId]);
  return (
    <SessionAuth>
      <CenteredLoading />
    </SessionAuth>
  );
};

export default FeatsIndexPage;
