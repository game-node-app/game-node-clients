import useOnMobile from "@/components/general/hooks/useOnMobile";
import { Stack } from "@mantine/core";
import {
  CenteredLoading,
  LibraryView,
  LibraryViewLayout,
  useUserProfile,
} from "@repo/ui";
import { useRouter } from "next/router";

const Index = () => {
  useOnMobile();
  const router = useRouter();
  const { userId } = router.query;
  useUserProfile(userId as string);

  if (!userId) return <CenteredLoading />;

  return (
    <Stack className={"lg:my-10"}>
      <LibraryViewLayout userId={userId as string} collectionId={undefined}>
        <LibraryView libraryUserId={userId as string} />
      </LibraryViewLayout>
    </Stack>
  );
};

export default Index;
