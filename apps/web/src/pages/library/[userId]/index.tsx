import React from "react";
import { useRouter } from "next/router";
import { Container, Stack } from "@mantine/core";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import {
  LibraryView,
  RecentCollectionEntriesView,
  useUserProfile,
  DetailsBox,
  LibraryHomeView,
  CenteredLoading,
} from "@repo/ui";

const Index = () => {
  const onMobile = useOnMobile();
  const router = useRouter();
  const { userId } = router.query;
  const userProfileQuery = useUserProfile(userId as string);

  if (!userId) return <CenteredLoading />;

  return (
    <LibraryView userId={userId as string} collectionId={undefined}>
      <LibraryHomeView userId={userId as string} />
    </LibraryView>
  );
};

export default Index;
