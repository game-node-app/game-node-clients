import React, { useEffect } from "react";
import { CenteredLoading, useRouter, useUserId } from "@repo/ui";

const Index = () => {
  const router = useRouter();

  const userId = useUserId();

  useEffect(() => {
    if (userId) {
      router.push(`/profile/${userId}?${router.query.toString()}`, {
        shallow: true,
        replace: true,
      });
    }
  }, [router, userId]);

  return <CenteredLoading />;
};

export default Index;
