import React, { useEffect } from "react";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SettingsTab } from "@repo/ui";

/** Old preferences categories, mapped to tabs of the settings modal. */
const CATEGORY_TO_SETTINGS_TAB: Record<string, SettingsTab> = {
  connections: "connections",
  account: "privacy",
  library: "library",
};

/**
 * Preferences moved to the settings modal. Shared code (connection callbacks,
 * importer, notifications) still links here, so keep redirecting.
 */
const Category = () => {
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    const tab =
      (typeof category === "string" && CATEGORY_TO_SETTINGS_TAB[category]) ||
      "connections";
    void router.replace(`/home?settings=${tab}`);
  }, [category, router]);

  return <CenteredLoading />;
};

export default Category;
