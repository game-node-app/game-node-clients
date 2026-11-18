import useOnMobile from "@/components/general/hooks/useOnMobile";
import { Stack } from "@mantine/core";
import {
  CenteredLoading,
  LibraryView,
  LibraryViewLayout,
  useUserProfile,
} from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps();

const Index = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  useOnMobile();
  const router = useRouter();
  const { userId } = router.query;
  useUserProfile(userId as string);

  if (!userId) return <CenteredLoading />;

  return (
    <Stack className={"lg:my-10"}>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.library.title", { username: seoProfile?.username })}
        description={t("seo.library.description", {
          username: seoProfile?.username,
        })}
      />
      <LibraryViewLayout userId={userId as string} collectionId={undefined}>
        <LibraryView libraryUserId={userId as string} />
      </LibraryViewLayout>
    </Stack>
  );
};

export default Index;
