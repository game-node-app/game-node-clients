import React from "react";
import { useRouter } from "next/router";
import { JournalOverviewView } from "@repo/ui";

const LibraryJournalPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  return <JournalOverviewView userId={userId as string} />;
};

export default LibraryJournalPage;
