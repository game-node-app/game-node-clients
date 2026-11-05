import React, { useEffect } from "react";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";

/** Preferences moved to the settings modal (`?settings=<tab>`). */
const Index = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      void router.replace("/home?settings=connections");
    }
  }, [router]);

  return <CenteredLoading />;
};

export default Index;
